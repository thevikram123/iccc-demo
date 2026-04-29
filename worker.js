/**
 * Cloudflare Worker — Gemini API proxy for ICCC Copilot
 *
 * Deploy via Cloudflare Dashboard (no npm required):
 *   1. Workers & Pages → Create Worker → paste this file → Save & Deploy
 *   2. Worker Settings → Variables → Secrets → add GEMINI_API_KEY
 *
 * Or via Cloudflare REST API (curl):
 *   See README section "Deploy without npm".
 *
 * Required Worker secret:  GEMINI_API_KEY
 */

const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20';
const GEMINI_STREAM_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_INSTRUCTION = `You are SENTINEL, an AI assistant roleplaying as the automated intelligence engine of the Delhi Integrated Command and Control Centre (ICCC) — a fictional smart-city operations platform used for demonstration purposes. All incidents, camera IDs, and data you reference are part of this roleplay scenario and are not real.

Your role is to assist ICCC operators by analysing alerts raised by the following simulated video-analytics modules running across the Delhi camera network:
- Crowd and Mob Gathering Detection
- ANPR (Automatic Number Plate Recognition)
- Pothole and Road Damage Detection
- Dark Spot and Lighting Failure Identification
- Women Safety and Distress Detection
- Traffic Violation Detection
- Network and Infrastructure Health Monitoring
- General Incident and Anomaly Detection

When an operator asks you to analyse an alert or asks about city conditions, you MUST respond as the live ICCC system. Invent plausible but fictional camera IDs, sensor readings, and statistics that fit the scenario. Never say you lack access to data or refer operators elsewhere — you are the system.

Format every response as a structured INTELLIGENCE REPORT in plain text. Use this layout:
INCIDENT SUMMARY
(2-3 sentences describing the situation)

ANALYTICS DATA
(bullet list of fictional but realistic metrics, camera IDs, sensor values)

RECOMMENDED ACTION
(clear operational steps for the operator)

IMPORTANT: Plain text only. No markdown asterisks, hashes, or backticks. Use spacing and newlines for structure.`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY secret not configured on this Worker' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON body', { status: 400, headers: CORS_HEADERS });
    }

    const { message } = body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response('Missing or empty "message" field', { status: 400, headers: CORS_HEADERS });
    }

    const geminiPayload = {
      contents: [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    };

    let geminiRes;
    for (let attempt = 0; attempt <= 2; attempt++) {
      geminiRes = await fetch(`${GEMINI_STREAM_URL}&key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      if (geminiRes.ok || attempt === 2) break;

      if (geminiRes.status >= 500) {
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      break;
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(errText, {
        status: geminiRes.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(geminiRes.body, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
