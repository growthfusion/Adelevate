// app/api/campaigns/route.js
import { NextResponse } from "next/server";

const SNAP_BASE = "https://adsapi.snapchat.com/v1";
const SNAP_TOKEN_URL = "https://accounts.snapchat.com/login/oauth2/access_token";

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? "*";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Vary": "Origin",
    };
}

// ---------- utils ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function withRetry(fn, tries = 3, delayMs = 600) {
    let lastErr;
    for (let i = 0; i < tries; i++) {
        try { return await fn(); }
        catch (e) { lastErr = e; await sleep(delayMs * (i + 1)); }
    }
    throw lastErr;
}
function onlyActivePaused(status) {
    if (!status) return false;
    const s = String(status).toUpperCase();
    return s === "ACTIVE" || s === "PAUSED";
}

// ---------- SNAP ----------
async function getSnapAccessToken() {
    const params = new URLSearchParams();
    params.set("grant_type", "refresh_token");
    params.set("client_id", process.env.SNAP_CLIENT_ID);
    params.set("client_secret", process.env.SNAP_CLIENT_SECRET);
    params.set("refresh_token", process.env.SNAP_REFRESH_TOKEN);

    const res = await fetch(SNAP_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
        // Avoid caching token responses
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error(`Snap token failed: ${res.status} ${await res.text()}`);
    }
    const j = await res.json();
    return j.access_token;
}

async function fetchSnapCampaignPage(adAccountId, accessToken, cursor) {
    const url = new URL(`${SNAP_BASE}/adaccounts/${adAccountId}/campaigns`);
    url.searchParams.set("limit", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error(`Snap campaigns failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
}

async function getAllSnapCampaigns(adAccountId, accessToken) {
    const all = [];
    let cursor;

    do {
        const page = await withRetry(() => fetchSnapCampaignPage(adAccountId, accessToken, cursor));
        // Some responses wrap as { campaigns: [{ campaigns: {...} }]}
        const raw = (page?.campaigns || []).map((w) => w.campaign || w);
        const data = raw
            .filter((c) => onlyActivePaused(c?.status))
            .map((c) => ({
                id: c.id,
                name: c.name,
                status: String(c.status || "").toUpperCase(),
                objective: c.objective || null,
                // Convert micros → whole currency (e.g., USD)
                daily_budget: c.daily_budget_micro ? Math.round(Number(c.daily_budget_micro) / 1_000_000) : null,
                created_time: c.created_at || null,
                updated_time: c.updated_at || null,
            }));

        all.push(...data);
        cursor = page?.paging?.next_cursor || page?.next_cursor;
    } while (cursor);

    return all;
}

async function getSnapAdAccountName(adAccountId, accessToken) {
    const res = await fetch(`${SNAP_BASE}/adaccounts/${adAccountId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });
    if (!res.ok) return adAccountId;
    const j = await res.json();
    const acct = j?.adaccount || j?.ad_account || j;
    return acct?.name || adAccountId;
}

// ---------- Handler ----------
export async function GET() {
    try {
        const snapAccounts = (process.env.SNAP_AD_ACCOUNTS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (!snapAccounts.length) {
            return NextResponse.json(
                { error: "SNAP_AD_ACCOUNTS is empty" },
                { status: 400 }
            );
        }

        const accessToken = await getSnapAccessToken();

        const results = await Promise.all(
            snapAccounts.map(async (acct) => {
                const [name, campaigns] = await Promise.all([
                    getSnapAdAccountName(acct, accessToken).catch(() => acct),
                    getAllSnapCampaigns(acct, accessToken).catch((e) => {
                        console.error("Snap campaigns error", acct, e);
                        return [];
                    }),
                ]);
                return [acct, { account_name: name, campaigns }];
            })
        );

        const payload = {
            platform: "snap",
            accounts: Object.fromEntries(results),
            total_campaigns: results.reduce((n, [, v]) => n + v.campaigns.length, 0),
            fetched_at: new Date().toISOString(),
        };

        // Helpful caching for UI navigation (freshen every 120s)
        return new NextResponse(JSON.stringify(payload), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                // Adjust as you like (or remove to always live-hit)
                "Cache-Control": "private, max-age=120",
                ...corsHeaders(),
            },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e?.message || "Failed to fetch Snapchat campaigns" },
            { status: 500, headers: corsHeaders() }
        );
    }
}
