import { NextResponse } from "next/server";

// ---------- Shared ----------
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
const SNAP_BASE = "https://adsapi.snapchat.com/v1";
const SNAP_TOKEN_URL = "https://accounts.snapchat.com/login/oauth2/access_token";

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

// META (Facebook)
const BUSINESS_MANAGERS = [
    {
        "bm_name": "Ring Junction",
        "access_token": process.env.META_RING_JUNCTION_TOKEN,
        "accounts": [
            {"id": "act_3144464092546266", "label": "Ring Junction Main"}
        ],
    },
    {
        "bm_name": "RJ CHA 3",
        "access_token": process.env.META_RJ_CHA_3_TOKEN,
        "accounts": [
            {"id": "act_2041396866636403", "label": "RJ CHA 3 - A1"},
            {"id": "act_2746263578893447", "label": "RJ CHA 3 - A2"},
            {"id": "act_558056744057635", "label": "RJ CHA 3 - A3"},
            {"id": "act_24117020837991544", "label": "RJ CHA 3 - A4"},
            {"id": "act_1271263723902192", "label": "RJ CHA 3 - A5"},
        ],
    },
    {
        "bm_name": "RJ CHA 4",
        "access_token": process.env.META_RJ_CHA_4_TOKEN,
        "accounts": [
            {"id": "act_690392397346714", "label": "RJ CHA 4 - A1"},
            {"id": "act_1434413991110490", "label": "RJ CHA 4 - A2"},
            {"id": "act_1091307482466390", "label": "RJ CHA 4 - A3"},
            {"id": "act_1680938772605957", "label": "RJ CHA 4 - A4"},
            {"id": "act_2360069734449540", "label": "RJ CHA 4 - A5"},
        ],
    },
    {
        "bm_name": "RJ CHA 5",
        "access_token": process.env.META_RJ_CHA_5_TOKEN,
        "accounts": [
            {"id": "act_963733905854794", "label": "RJ CHA 5 - A1"}
        ],
    },
    {
        "bm_name": "Sharp Ads - CHA",
        "access_token": process.env.META_SHARP_ADS_CHA_TOKEN,
        "accounts": [
            {"id": "act_1217656482924498", "label": "Sharp Ads CHA - A1"},
            {"id": "act_989742639904250", "label": "Sharp Ads CHA - A2"},
            {"id": "act_575303005054340", "label": "Sharp Ads CHA - A3"},
        ],
    },
]

// ---------- META (BM tokens only) ----------
const FB_BASE = "https://graph.facebook.com/v19.0";

function normalizeDailyBudget(minor) {
    if (minor == null) return null;
    const n = Number(minor);
    if (!Number.isFinite(n)) return null;
    return Math.round(n / 100); // cents -> whole currency
}

function normalizeActId(id) {
    return id.startsWith("act_") ? id : `act_${id}`;
}

function buildFbUrl(path, params, token) {
    const url = new URL(`${FB_BASE}/${path.replace(/^\//, "")}`);
    url.searchParams.set("access_token", token);
    for (const [k, v] of Object.entries(params || {})) {
        if (v != null && v !== "") url.searchParams.set(k, v);
    }
    return url.toString();
}

async function fetchMetaCampaignPage(adAccountId, cursor, token) {
    const account = normalizeActId(adAccountId);
    const fields = ["id","name","status","objective","daily_budget","created_time","updated_time"].join(",");
    const params = { fields, limit: "500" };
    if (cursor) params.after = cursor;

    const url = buildFbUrl(`${account}/campaigns`, params, token);
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(`Meta campaigns failed [${account}]: ${res.status} ${await res.text()}`);
    return res.json();
}

async function getAllMetaCampaigns(adAccountId, token, includeAllStatuses = false) {
    const all = [];
    let cursor;
    do {
        const page = await withRetry(() => fetchMetaCampaignPage(adAccountId, cursor, token));
        const data = page?.data || [];
        for (const c of data) {
            if (!includeAllStatuses && !onlyActivePaused(c?.status)) continue;
            all.push({
                id: c.id,
                name: c.name,
                status: String(c.status || "").toUpperCase(),
                objective: c.objective ?? null,
                daily_budget: normalizeDailyBudget(c.daily_budget),
                created_time: c.created_time ?? null,
                updated_time: c.updated_time ?? null,
            });
        }
        cursor = page?.paging?.cursors?.after;
    } while (cursor);
    return all;
}

async function getMetaAdAccountName(adAccountId, token) {
    const account = normalizeActId(adAccountId);
    const url = buildFbUrl(account, { fields: "name,account_id" }, token);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return adAccountId;
    const j = await res.json();
    return j?.name || adAccountId;
}

// ---------- NEWSBREAK ----------
// Added constants for NewsBreak API
const NEWSBREAK_CAMPAIGN_URL = "https://business.newsbreak.com/business-api/v1/campaign/getList";
const NEWSBREAK_API_KEY = process.env.NEWSBREAK_API_KEY?.trim() || "";

// Fetch campaigns for a single NewsBreak ad account
async function fetchNewsBreakCampaigns(accountId) {
    const url = new URL("https://business.newsbreak.com/business-api/v1/campaign/getList");
    url.searchParams.set("adAccountId", accountId);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("pageSize", "1000"); // fetch all campaigns

    try {
        const res = await fetch(url.toString(), {
            method: "GET",
            headers: { "Access-Token": NEWSBREAK_API_KEY?.trim() },
            cache: "no-store",
        });

        const text = await res.text();

        if (!res.ok) {
            console.error(`NewsBreak fetch failed for account ${accountId}: ${res.status} - ${text}`);
            return { campaigns: [], error: `NewsBreak fetch failed: ${res.status} ${text}` };
        }

        const json = JSON.parse(text); // parse manually
        return {
            campaigns: (json?.data?.list || []).map(c => ({
                id: c.id,
                name: c.name,
                objective: c.objective,
                status: c.onlineStatus,
                daily_budget: null,
                created_time: c.createTime,
                updated_time: c.updateTime,
            }))
        };
    } catch (e) {
        console.error(`Error fetching NewsBreak campaigns for ${accountId}:`, e);
        return { campaigns: [], error: e.message };
    }
}

// Fetch campaigns for all configured NewsBreak accounts
async function getAllNewsBreakCampaigns() {
    const nbAccounts = (process.env.NEWSBREAK_AD_ACCOUNTS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    const results = await Promise.all(
        nbAccounts.map(async acct => {
            const data = await fetchNewsBreakCampaigns(acct);
            return [acct, data];
        })
    );

    return Object.fromEntries(results);
}

// ---------- Handler ----------
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const platform = (searchParams.get("platform") || "snap").toLowerCase();
        const statusParam = (searchParams.get("status") || "").toLowerCase();
        const includeAllStatuses = statusParam === "all";

        if (platform === "snap") {
            const snapAccounts = (process.env.SNAP_AD_ACCOUNTS || "")
                .split(",").map((s) => s.trim()).filter(Boolean);
            if (!snapAccounts.length) {
                return NextResponse.json({ error: "SNAP_AD_ACCOUNTS is empty" }, { status: 400, headers: corsHeaders() });
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

            return new NextResponse(JSON.stringify(payload), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "private, max-age=120",
                    ...corsHeaders(),
                },
            });
        }

        if (platform === "meta") {
            // Iterate BMs; require BM token; skip those without token (add error per BM).
            const bmEntries = await Promise.all(
                BUSINESS_MANAGERS.map(async (bm) => {
                    const token = (bm.access_token || "").trim();
                    if (!token) {
                        return [bm.bm_name, { accounts: {}, error: "Missing BM access_token" }];
                    }

                    const accountEntries = await Promise.all(
                        (bm.accounts || []).map(async (acct) => {
                            const id = acct.id;
                            try {
                                const [account_name, campaigns] = await Promise.all([
                                    getMetaAdAccountName(id, token).catch(() => id),
                                    getAllMetaCampaigns(id, token, includeAllStatuses).catch((e) => {
                                        console.error("Meta campaigns error", id, e);
                                        return [];
                                    }),
                                ]);
                                return [normalizeActId(id), {
                                    label: acct.label || null,
                                    account_name,
                                    campaigns,
                                }];
                            } catch (e) {
                                console.error("Meta account error", id, e);
                                return [normalizeActId(id), {
                                    label: acct.label || null,
                                    account_name: id,
                                    campaigns: [],
                                    error: e?.message || "Failed to fetch",
                                }];
                            }
                        })
                    );

                    return [bm.bm_name, { accounts: Object.fromEntries(accountEntries) }];
                })
            );

            const business_managers = Object.fromEntries(bmEntries);

            // compute total
            let total = 0;
            for (const bmName of Object.keys(business_managers)) {
                const accs = business_managers[bmName]?.accounts || {};
                for (const actId of Object.keys(accs)) {
                    total += (accs[actId]?.campaigns?.length || 0);
                }
            }

            const payload = {
                platform: "meta",
                business_managers,
                total_campaigns: total,
                fetched_at: new Date().toISOString(),
            };

            return new NextResponse(JSON.stringify(payload), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "private, max-age=120",
                    ...corsHeaders(),
                },
            });
        }

        else if (platform === "newsbreak") {
            const accounts = await getAllNewsBreakCampaigns();

            // compute total campaigns
            let total = 0;
            for (const acct of Object.values(accounts)) {
                total += acct.campaigns?.length || 0;
            }

            return new NextResponse(JSON.stringify({
                platform: "newsbreak",
                accounts,              // { accountId: { campaigns: [...] } }
                total_campaigns: total,
                fetched_at: new Date().toISOString(),
            }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "private, max-age=120",
                    ...corsHeaders(),
                },
            });
        }

        return NextResponse.json(
            { error: "Unsupported platform. Use ?platform=snap or ?platform=meta" },
            { status: 400, headers: corsHeaders() }
        );

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e?.message || "Failed to fetch campaigns" },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}