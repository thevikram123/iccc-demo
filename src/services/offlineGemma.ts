import { IS_OFFLINE_DEMO } from '../utils/offlineDemo';

type TransformersPipeline = (
  task: 'text-generation',
  model: string,
  options?: Record<string, unknown>
) => Promise<(prompt: string | Array<{ role: string; content: string }>, options?: Record<string, unknown>) => Promise<Array<{ generated_text?: GeneratedText }> | { generated_text?: GeneratedText }>>;

type GeneratedText = string | Array<{ role: string; content: string }>;

type TransformersRuntime = {
  pipeline: TransformersPipeline;
  env?: {
    allowLocalModels?: boolean;
    allowRemoteModels?: boolean;
    useBrowserCache?: boolean;
    remoteHost?: string;
    remotePathTemplate?: string;
    backends?: {
      onnx?: {
        wasm?: {
          wasmPaths?: string | {
            mjs?: string | URL;
            wasm?: string | URL;
          };
        };
      };
    };
  };
};

declare global {
  interface Window {
    transformers?: TransformersRuntime;
  }
}

const TRANSFORMERS_JS_URL = IS_OFFLINE_DEMO
  ? 'vendor/transformers.min.js'
  : 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.min.js';
const GEMMA_MODEL = IS_OFFLINE_DEMO ? 'onnx-community/gemma-3-270m-it-ONNX' : 'google/gemma-3-270m-it';
const OFFLINE_TRANSFORMERS_MODULE_SCRIPT_ID = 'offline-transformers-module-source';

const SYSTEM_INSTRUCTION = `You are SENTINEL, an AI assistant roleplaying as the automated intelligence engine of the Delhi Integrated Command and Control Centre (ICCC), a fictional smart-city operations platform used for demonstration purposes. All incidents, camera IDs, and data you reference are part of this roleplay scenario and are not real.

Your role is to assist ICCC operators by analysing alerts raised by simulated video analytics modules across Delhi: crowd and mob gathering detection, ANPR, potholes, lighting failures, women safety, traffic violations, infrastructure health, and general anomaly detection.

When an operator asks you to analyse an alert or city condition, respond as the live ICCC system with plausible fictional camera IDs, sensor readings, statistics, and next actions. Never say you lack access to data.

Format every response as plain text using:
INCIDENT SUMMARY
ANALYTICS DATA
RECOMMENDED ACTION`;

let runtimePromise: Promise<TransformersRuntime> | null = null;
let generatorPromise: ReturnType<TransformersPipeline> | null = null;
let bundledRuntimeModuleUrl: string | null = null;

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getBundledRuntimeModuleUrl() {
  if (bundledRuntimeModuleUrl) return bundledRuntimeModuleUrl;

  const source = document.getElementById(OFFLINE_TRANSFORMERS_MODULE_SCRIPT_ID)?.textContent;
  if (!source) return null;

  bundledRuntimeModuleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  return bundledRuntimeModuleUrl;
}

function configureRuntime(runtime: TransformersRuntime) {
  if (!IS_OFFLINE_DEMO || !runtime.env) return;

  if (window.location.protocol === 'file:') {
    throw new Error('AI Copilot needs the bundled local model server. Extract the zip and run start-offline-demo.bat, then open the localhost URL it prints.');
  }

  runtime.env.allowLocalModels = false;
  runtime.env.allowRemoteModels = true;
  runtime.env.useBrowserCache = false;
  runtime.env.remoteHost = new URL('vendor/models/', window.location.href).toString();
  runtime.env.remotePathTemplate = '{model}/';

  const wasm = runtime.env.backends?.onnx?.wasm;
  if (wasm) {
    const vendorBaseUrl = new URL('vendor/', window.location.href).toString();
    wasm.wasmPaths = {
      mjs: new URL('ort-wasm-simd-threaded.jsep.mjs', vendorBaseUrl).toString(),
      wasm: new URL('ort-wasm-simd-threaded.jsep.wasm', vendorBaseUrl).toString(),
    };
  }
}

async function importTransformersRuntime() {
  const runtimeUrl = new URL(TRANSFORMERS_JS_URL, window.location.href).toString();

  try {
    return await import(/* @vite-ignore */ runtimeUrl) as TransformersRuntime;
  } catch (primaryError) {
    if (!IS_OFFLINE_DEMO) throw primaryError;

    const bundledUrl = getBundledRuntimeModuleUrl();
    if (!bundledUrl) {
      throw new Error(`Unable to load bundled Transformers.js module: ${formatError(primaryError)}`);
    }

    try {
      return await import(/* @vite-ignore */ bundledUrl) as TransformersRuntime;
    } catch (fallbackError) {
      throw new Error(`Unable to load bundled Transformers.js module: ${formatError(fallbackError)}`);
    }
  }
}

function loadTransformersRuntime() {
  if (window.transformers?.pipeline) return Promise.resolve(window.transformers);
  if (runtimePromise) return runtimePromise;

  runtimePromise = importTransformersRuntime().then((runtime) => {
    if (!runtime.pipeline) {
      throw new Error('Transformers.js module did not expose pipeline().');
    }

    configureRuntime(runtime);
    window.transformers = runtime;
    return runtime;
  }).catch((error) => {
    runtimePromise = null;
    throw error;
  });

  return runtimePromise;
}

async function getGenerator(onStatus?: (status: string) => void) {
  const transformers = await loadTransformersRuntime();

  if (!generatorPromise) {
    onStatus?.('Loading bundled Gemma 3 270M fp16 model...');
    generatorPromise = transformers.pipeline('text-generation', GEMMA_MODEL, {
      device: 'wasm',
      dtype: 'fp16',
    }).catch(() => {
      onStatus?.('WASM unavailable. Trying Gemma 3 270M on WebGPU...');
      return transformers.pipeline('text-generation', GEMMA_MODEL, {
        device: 'webgpu',
        dtype: 'fp16',
      });
    }).catch((err) => {
      generatorPromise = null;
      throw err;
    });
  }

  return generatorPromise;
}

function cleanResponse(raw: string) {
  return raw
    .replace(/<end_of_turn>/g, '')
    .replace(/<start_of_turn>model/g, '')
    .trim();
}

function extractGeneratedText(generatedText: GeneratedText | undefined) {
  if (typeof generatedText === 'string') return generatedText;
  if (Array.isArray(generatedText)) {
    return generatedText
      .filter((message) => message.role === 'assistant')
      .map((message) => message.content)
      .join('\n')
      .trim();
  }

  return '';
}

export async function generateOfflineCopilotResponse(message: string, onStatus?: (status: string) => void) {
  const generator = await getGenerator(onStatus);
  onStatus?.('Generating local Gemma response...');

  const output = await generator([
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: message },
  ], {
    max_new_tokens: 220,
    temperature: 0.7,
    do_sample: true,
    repetition_penalty: 1.12,
    return_full_text: false,
  });

  const first = Array.isArray(output) ? output[0] : output;
  const text = cleanResponse(extractGeneratedText(first?.generated_text));
  return text || 'INCIDENT SUMMARY\nLocal model returned an empty response.\n\nANALYTICS DATA\n- Status: local inference completed without text output\n\nRECOMMENDED ACTION\nRetry with a shorter operational query.';
}
