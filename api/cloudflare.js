// api/cloudflare.js — Vercel serverless function
export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  const token = process.env.VITE_CLOUDFLARE_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "No token" }), { status: 500 });
  }

  try {
    const res = await fetch(
      "https://api.cloudflare.com/client/v4/radar/attacks/layer3/top/locations/origin?limit=20&format=json&dateRange=1d",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}