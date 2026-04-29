const MODEL = 'gemini-3-flash-preview';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
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

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let message;
    try {
      ({ message } = await request.json());
    } catch {
      return new Response('Invalid JSON body', { status: 400 });
    }

    if (!message) {
      return new Response(JSON.stringify({ error: { message: 'Missing "message" field' } }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    const geminiRes = await fetch(
      `${GEMINI_BASE}/models/${MODEL}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(errText, {
        status: geminiRes.status,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    return new Response(geminiRes.body, {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  },
};
