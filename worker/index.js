const MODEL = 'gemma-4-31b-it';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const SYSTEM_INSTRUCTION = `You are the AI Copilot for the Delhi Integrated Command and Control Centre (ICCC).
We have various kinds of video analytics running on CCTV cameras across Delhi, including:
- Pothole Detection
- Crowd / Mob Gathering
- ANPR (Automatic Number Plate Recognition)
- Dark Spot Identification
- Distress Detection (e.g., Women Safety)
- Traffic Violation Detection
- Incident & Anomaly Detection

You have access to a wide range of video analytics data, Delhi area intelligence, safety, traffic, and public infrastructure status.
When asked a question about a location or an issue (like "Potholes in Vasant Kunj?" or "Traffic violations in South Delhi"), you MUST provide a specific, authoritative, and structured situation report. DO NOT say you cannot see real-time markers or refer the user to other departments. You are the system.

Format your responses as a crisp, military-style INTELLIGENCE REPORT.
Include:
- INCIDENT SUMMARY
- ANALYTICS DATA (invent plausible numbers and specific camera IDs if needed to demonstrate the system's capability)
- RECOMMENDED ACTION (e.g., Dispatching PWD response team, escalating to traffic police)

IMPORTANT: Format your answers neatly as plain text. Do NOT use markdown formatting like asterisks (**), hashes (#), or backticks. Use clear spacing and paragraphs.`;

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
      return new Response('Missing "message" field', { status: 400 });
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
