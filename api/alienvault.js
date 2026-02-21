export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const key = process.env.VITE_ALIENVAULT_KEY;
  if (!key) return new Response(JSON.stringify({ error: "No key" }), { status: 500 });

  const url  = new URL(req.url);
  const path = url.searchParams.get("path") || "pulses/activity?limit=10";

  try {
    const res = await fetch(
      `https://otx.alienvault.com/api/v1/${path}`,
      { headers: { "X-OTX-API-KEY": key } }
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