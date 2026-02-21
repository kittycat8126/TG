export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const key = process.env.VITE_ABUSEIPDB_KEY;
  if (!key) return new Response(JSON.stringify({ error: "No key" }), { status: 500 });

  try {
    const res = await fetch(
      "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=85&limit=20",
      { headers: { "Key": key, "Accept": "application/json" } }
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}