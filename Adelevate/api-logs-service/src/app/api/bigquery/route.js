export const runtime = "nodejs";
import { BigQuery } from "@google-cloud/bigquery";

const SERVICE_ACCOUNT = {
    type: "service_account",
    project_id: process.env.GCP_PROJECT_ID,
    private_key_id: process.env.GCP_PRIVATE_KEY_ID,
    private_key: process.env.GCP_PRIVATE_KEY,
    client_email: process.env.GCP_CLIENT_EMAIL,
    client_id: process.env.GCP_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/pristine-lodge-459019-p4%40appspot.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET;
const META_TABLE = process.env.BQ_META_TABLE;
const SNAP_TABLE = process.env.BQ_SNAP_TABLE;
const BQ_LOCATION = process.env.BQ_LOCATION || "US";

// Allow the Vite dev origin:
// --- CORS setup ---
const ORIGINS = new Set(
    (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean)
);

function corsHeaders(req) {
    const origin = req.headers.get("origin");
    const allowed = ORIGINS.has(origin) ? origin : "*";
    return {
        "Access-Control-Allow-Origin": allowed,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

export async function OPTIONS(req) {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
}

function getBQ() {
    return new BigQuery({
        projectId: PROJECT_ID,
        credentials: {
            client_email: SERVICE_ACCOUNT.client_email,
            private_key: SERVICE_ACCOUNT.private_key,
        },
    });
}

function parseParams(url) {
    const sp = new URL(url).searchParams;
    const end = sp.get("end") ? new Date(sp.get("end")) : new Date();
    const start = sp.get("start") ? new Date(sp.get("start")) : new Date(end.getTime() - 3 * 24 * 3600 * 1000);
    const limit = Math.min(parseInt(sp.get("limit") || "200", 10), 1000);
    const offset = Math.max(parseInt(sp.get("offset") || "0", 10), 0);        // ← add this
    const platform = sp.get("platform");
    const debug = ((sp.get("debug") || "").trim() === "1");
    const schema = (sp.get("schema") || "").trim().toLowerCase();
    return { start, end, limit, offset, platform, debug, schema };            // ← include offset
}

export async function GET(req) {
    try {
        const { start, end, limit, offset, platform, debug, schema } = parseParams(req.url);
        const bq = getBQ();

        // ---- Schema/debug helpers ----
        if (debug) {
            const ds = bq.dataset(DATASET);
            const [dsMeta] = await ds.getMetadata();
            const [metaExists] = await ds.table(META_TABLE).exists();
            const [snapExists] = await ds.table(SNAP_TABLE).exists();
            return new Response(
                JSON.stringify({
                    project: PROJECT_ID,
                    dataset: DATASET,
                    dataset_location: dsMeta.location,
                    tables: {
                        [META_TABLE]: metaExists,
                        [SNAP_TABLE]: snapExists,
                    },
                    tip: "If dataset_location != BQ_LOCATION, set BQ_LOCATION to match (e.g., 'asia-south1').",
                }),
                { status: 200, headers: { "content-type": "application/json" } }
            );
        }

        if (schema === "meta" || schema === "snap") {
            const tableName = schema === "meta" ? META_TABLE : SNAP_TABLE;
            const [meta] = await bq.dataset(DATASET).table(tableName).getMetadata();
            const fields = meta?.schema?.fields || [];
            return new Response(JSON.stringify({ table: `${PROJECT_ID}.${DATASET}.${tableName}`, fields }), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }

        const sql = `
          DECLARE tz STRING DEFAULT 'Asia/Kolkata';
        
          WITH unioned AS (
            SELECT 'Meta' AS platform, * 
            FROM \`${PROJECT_ID}.${DATASET}.${META_TABLE}\`
            WHERE event_ts BETWEEN @start AND @end
        
            UNION ALL
        
            SELECT 'Snap' AS platform, * 
            FROM \`${PROJECT_ID}.${DATASET}.${SNAP_TABLE}\`
            WHERE event_ts BETWEEN @start AND @end
          )
        
          SELECT
            unioned.*,
            UNIX_MILLIS(TIMESTAMP(event_ts)) AS ts_ms,
            FORMAT_TIMESTAMP('%H:%M', TIMESTAMP(event_ts), tz)    AS time,
            FORMAT_TIMESTAMP('%d %b %Y', TIMESTAMP(event_ts), tz) AS date
          FROM unioned
          ${platform ? `WHERE platform = @pf` : ``}
          ORDER BY event_ts DESC
          LIMIT @limit
          OFFSET @offset
        `;


        const [job] = await bq.createQueryJob({
            query: sql,
            location: BQ_LOCATION,
            params: {
                start,
                end,
                limit,
                offset,
                ...(platform ? { pf: platform === "meta" ? "Meta" : "Snap" } : {}),
            },
            useLegacySql: false,
        });

        const [rows] = await job.getQueryResults({ location: BQ_LOCATION });

        return new Response(JSON.stringify({ rows }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (e) {
        console.error("BigQuery API error:", e);
        return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500 });
    }
}
