export const runtime = "nodejs";
import { BigQuery } from "@google-cloud/bigquery";

const SERVICE_ACCOUNT = {
    type: "service_account",
    project_id: "pristine-lodge-459019-p4",
    private_key_id: "c48b011567def3dea23817149b7ab6e26b4abba4",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDkiITrn6MEoTHA\nqKeXs8qToHSg87E21LBAF8TZVnC0dJBzM4I+EwWEaI8lQTN/1tgUr3l6E4kMYian\nxgp7fPGBloilK6YZcoW3eMAbHbTS93cDS+Df6kVf+8GBm5+QsHaZq5/cbgqoS70R\nx1uLbmjgYONnrqjiJ+6kX3e1NfWGh+JQm/UplHyE8tHcoQKfqhdTRpNSiXCCPUl/\nf6vxXM6jY83iKDWH+2o5Tm3RH0Ik47KAkB4kYzVtFsv6agPctFsNns0HZ7ZW2xHK\nIDS3iOBFxS12oroQoLy5uKpsaP6rmwwHMaLUgxqj9qZsNwGnBE0/q5SqHuYC6ozg\nK5WU8aCDAgMBAAECggEAC0drm/9wecGE5ZfNUbDnbhrMtsbgN68OldM2fW2FOXrJ\nSE5B/tNMgejxK6sIoiYV2wuACNTe/jP36W7eRJL5jmZCDzjUxUvAKrp0bMIuEv1w\nq8J6ckKrMt4HgmCOYwM6j0IHrUbnEsBOMArxSzPjTDOr9YmKv0KuRgGKNHDZ0c5a\nJW614G1pSADsP4VhZTqM0h4xVV0Zs2pg5/woswCQCHnFteNbbtHD0adNJ8m+cPJY\n7jencxaOOTVB4X5FZd0PJ7lA7WpTOiSMUO7KCeMcFjcwrqqntWgcVQlbiLgJoeB+\n08SsusFwIn/ihPaiNAXf+of3abBLRxPeQo2eFseExQKBgQDlFMva5rLoFEN8LKHJ\nfins+EIG/7AsBNz5Pn6O9mSQRRz39PCu+OkYztsse8hCI03yH9kbAe3JxX2jPNC2\ngid5+rInD1/G3za43rz2bL0konEfMsGocWYHKVeJdKD5Z7d8I2lMGy8oipg1lH2O\nNZ2RyIE0Hd/Y89EWqGs1+4j97wKBgQD/Yz1C0CKfNftBjJGScHQrujDLhI7dUh3D\n5ea+JlxmpqHW8V3i6Lqm8LaLhrxABVJUBVVU/iFDTv68pV4wLXCpc3N2d6y1I4be\nUqBOqV1JKodPsPTJRup5o2YwRtfcly5CqUsCmLTKVTPHexIzZqGT5kq2h0iC/2q3\n/rJGKWharQKBgQDgZpzC09ZRLPhmfToGrQXY0d+sB2/FzwW/Sg6jcI1WHb2gz1mt\nrLp5yLg+PQsQbpD+K2B66krKqiDGdN5mydxtyrwVMyQ5JZLvSZGFO0OUzWNOkmPN\n4zd0sHTFe2/soELG4dFV8hMh/ZHYepr7YV323phiOxl55mzdayGKgdnSFQKBgG4n\n9AiZlhVuR03iv/eWIcWqrdla9/RmswgIZhqmmTx9q1j3CzQQhlHziglsuE40/WnY\nUxIx+075B89+1L2bG/k7HxZ+UDRheo7yvMqxKtegTHUHMs6OlBybajxwkjNH0mBW\nfVBFZdXQImFsqFEbd54/uwI4IALBANsUNPkmayiRAoGAERJZf/i2DG80IOoQfh+/\njcZaxTv2skkT1bvHfxdfg3jjvO0aVt1skvJw2lgGcBU4GrtgZf/0OH52gZhuPm+L\ntxleeoj1XJM/wFgvsOugc5XljivUYKfuz9Jjxp87K160NSigUgOia+AeSJhmEpNa\nbswr8ywc2j27FckqNDJA6Ds=\n-----END PRIVATE KEY-----\n",
    client_email: "pristine-lodge-459019-p4@appspot.gserviceaccount.com",
    client_id: "114284113008582339854",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/pristine-lodge-459019-p4%40appspot.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

const PROJECT_ID = "pristine-lodge-459019-p4";
const DATASET = "raw";
const META_TABLE = "meta_paused_campaigns_log";
const SNAP_TABLE = "paused_campaigns_log";

// Allow the Vite dev origin:
// --- CORS setup ---
const ORIGINS = new Set([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]);

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



let BQ_LOCATION = "US";

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
