import { IS_OFFLINE_DEMO } from '../utils/offlineDemo';

type TransformersPipeline = (
  task: 'text-generation',
  model: string,
  options?: Record<string, unknown>
) => Promise<(prompt: string, options?: Record<string, unknown>) => Promise<Array<{ generated_text?: string }> | { generated_text?: string }>>;

declare global {
  interface Window {
    transformers?: {
      pipeline: TransformersPipeline;
    };
  }
}

const TRANSFORMERS_JS_URL = IS_OFFLINE_DEMO
  ? 'vendor/transformers.min.js'
  : 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';
const GEMMA_MODEL = 'google/gemma-3-270m-it';

const SYSTEM_INSTRUCTION = `You are SENTINEL, an AI assistant roleplaying as the automated intelligence engine of the Delhi Integrated Command and Control Centre (ICCC), a fictional smart-city operations platform used for demonstration purposes. All incidents, camera IDs, and data you reference are part of this roleplay scenario and are not real.

Your role is to assist ICCC operators by analysing alerts raised by simulated video analytics modules across Delhi: crowd and mob gathering detection, ANPR, potholes, lighting failures, women safety, traffic violations, infrastructure health, and general anomaly detection.

When an operator asks you to analyse an alert or city condition, respond as the live ICCC system with plausible fictional camera IDs, sensor readings, statistics, and next actions. Never say you lack access to data.

Format every response as plain text using:
INCIDENT SUMMARY
ANALYTICS DATA
RECOMMENDED ACTION`;

let scriptPromise: Promise<void> | null = null;
let generatorPromise: ReturnType<TransformersPipeline> | null = null;

function loadTransformersScript() {
  if (window.transformers?.pipeline) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-transformers-runtime]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Transformers.js')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = new URL(TRANSFORMERS_JS_URL, window.location.href).toString();
    script.async = true;
    script.dataset.transformersRuntime = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Transformers.js'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

async function getGenerator(onStatus?: (status: string) => void) {
  await loadTransformersScript();
  if (!window.transformers?.pipeline) {
    throw new Error('Transformers.js did not initialize.');
  }

  if (!generatorPromise) {
    onStatus?.('Loading Gemma 3 270M. First run needs internet; later runs use the browser cache.');
    generatorPromise = window.transformers.pipeline('text-generation', GEMMA_MODEL, {
      device: 'webgpu',
      dtype: 'q4',
    }).catch(() => {
      onStatus?.('WebGPU unavailable. Loading Gemma 3 270M on CPU/WASM...');
      return window.transformers!.pipeline('text-generation', GEMMA_MODEL, {
        device: 'wasm',
        dtype: 'q4',
      });
    });
  }

  return generatorPromise;
}

function buildPrompt(message: string) {
  return `<start_of_turn>system
${SYSTEM_INSTRUCTION}<end_of_turn>
<start_of_turn>user
${message}<end_of_turn>
<start_of_turn>model
`;
}

function cleanResponse(raw: string, prompt: string) {
  return raw
    .replace(prompt, '')
    .replace(/<end_of_turn>/g, '')
    .replace(/<start_of_turn>model/g, '')
    .trim();
}

export async function generateOfflineCopilotResponse(message: string, onStatus?: (status: string) => void) {
  const generator = await getGenerator(onStatus);
  onStatus?.('Generating local Gemma response...');

  const prompt = buildPrompt(message);
  const output = await generator(prompt, {
    max_new_tokens: 220,
    temperature: 0.7,
    do_sample: true,
    repetition_penalty: 1.12,
    return_full_text: false,
  });

  const first = Array.isArray(output) ? output[0] : output;
  const text = first?.generated_text ? cleanResponse(first.generated_text, prompt) : '';
  return text || 'INCIDENT SUMMARY\nLocal model returned an empty response.\n\nANALYTICS DATA\n- Status: local inference completed without text output\n\nRECOMMENDED ACTION\nRetry with a shorter operational query.';
}
