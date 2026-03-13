const allowedMethods = "POST,OPTIONS";
const allowedHeaders = "Content-Type";

function parseAllowedOrigins(raw) {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Allow-Headers": allowedHeaders,
    "Vary": "Origin"
  };
}

function jsonResponse(origin, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin)
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGIN);
    const isAllowedOrigin = !!origin && allowedOrigins.includes(origin);

    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "portfolio-contact-proxy",
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!isAllowedOrigin) {
      return jsonResponse(origin, 403, { ok: false, error: "forbidden_origin" });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return jsonResponse(origin, 405, { ok: false, error: "method_not_allowed" });
    }

    if (!env.FORMSPREE_ID || !env.TURNSTILE_SECRET) {
      return jsonResponse(origin, 500, { ok: false, error: "missing_worker_secrets" });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(origin, 400, { ok: false, error: "invalid_json" });
    }

    const { name, email, message, turnstileToken } = payload || {};

    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim();
    const safeMessage = String(message || "").trim();
    const safeTurnstileToken = String(turnstileToken || "").trim();

    if (!safeName || !safeEmail || !safeMessage || !safeTurnstileToken) {
      return jsonResponse(origin, 400, { ok: false, error: "missing_required_fields" });
    }

    if (!isValidEmail(safeEmail)) {
      return jsonResponse(origin, 400, { ok: false, error: "invalid_email" });
    }

    if (safeName.length > 100 || safeEmail.length > 254 || safeMessage.length > 5000) {
      return jsonResponse(origin, 400, { ok: false, error: "field_limits_exceeded" });
    }

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: safeTurnstileToken,
        remoteip: request.headers.get("CF-Connecting-IP") || ""
      })
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.success) {
      return jsonResponse(origin, 400, { ok: false, error: "turnstile_verification_failed" });
    }

    const formspreeResponse = await fetch(`https://formspree.io/f/${env.FORMSPREE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ name: safeName, email: safeEmail, message: safeMessage })
    });

    if (!formspreeResponse.ok) {
      return jsonResponse(origin, 502, { ok: false, error: "upstream_submission_failed" });
    }

    return jsonResponse(origin, 200, { ok: true });
  }
};