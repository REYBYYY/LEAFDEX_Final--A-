import { GoogleGenAI } from '@google/genai';

// Lazily-created Gemini client, mirroring the Resend pattern in email.js.
// If no API key is configured, `getGenAI()` returns null and callers fall back
// to the client-side botanical database instead of erroring.
let genAI = null;

export function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// ---------------------------------------------------------------------------
// Which model to use.
//
// This is deliberately NOT hard-coded to a name picked by probing, because
// "which Gemini model works" varies by API key, region, and by the minute during
// a capacity spike. Availability observed from one machine tells you nothing
// about another. So the choice is:
//   1. GEMINI_MODEL from .env, if set  — the authoritative answer, always wins.
//   2. The first live model discovered from the API for this key.
//   3. A conservative built-in default.
// Failure histories seen in the wild, kept here so nobody re-tries them blindly:
//   gemini-2.5-flash    -> 404, withdrawn for newer API keys
//   gemini-3.5-flash    -> 503, does not resolve
//   *-latest aliases    -> 503 during demand spikes
// ---------------------------------------------------------------------------
const CONFIGURED_MODEL = process.env.GEMINI_MODEL || null;
const FALLBACK_MODEL = process.env.GEMINI_MODEL_FALLBACK || 'gemini-3.5-flash';
const DEFAULT_MODEL = 'gemini-3-flash-preview';

// Preferred models, best-first. Discovery picks the earliest entry the key
// reports as usable, so ordering here is the priority.
//
// Benchmarked on a real leaf image (see the notes on each entry). The ordering
// optimises for SPEED AT CORRECT IDENTIFICATION, not raw speed: on this key some
// faster models answered fluently without actually reading the photo, which is
// worse than useless for a plant scanner. `-flash` is preferred over `-flash-lite`
// when both work, because lite tiers answered with lower field coverage.
const PREFERRED_MODELS = [
  'gemini-3-flash-preview', // ~2.3s, all fields filled, correct
  'gemini-3.5-flash-lite', // ~1.5s, correct, lighter field coverage
  'gemini-3.1-flash-lite', // ~1.9s, correct
  'gemini-3.6-flash', // slower under load, but highest quality when available
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

// Models the key may use for generateContent, cached for the process lifetime.
// A failed discovery is remembered too, so a broken call is not retried on every
// single scan.
let discoveredModels = null;
let discoveryPromise = null;

async function discoverModels(client) {
  if (discoveredModels) return discoveredModels;
  if (discoveryPromise) return discoveryPromise;

  discoveryPromise = (async () => {
    try {
      const listed = await client.models.list();
      const names = [];
      for await (const item of listed) {
        const raw = item?.name || '';
        const short = raw.replace(/^models\//, '');
        const methods = item?.supportedGenerationMethods || item?.supportedActions || [];
        // Only models that can actually take an image prompt.
        if (!short) continue;
        if (methods.length && !methods.includes('generateContent')) continue;
        if (/embedding|aqa|imagen|veo|tts|image-generation/i.test(short)) continue;
        names.push(short);
      }
      discoveredModels = names;
      if (names.length) {
        console.log(`[vision] ${names.length} model(s) available to this key: ${names.slice(0, 8).join(', ')}${names.length > 8 ? ', …' : ''}`);
      }
      return names;
    } catch (error) {
      console.warn(`[vision] model discovery failed: ${error?.message || error}`);
      discoveredModels = []; // Do not retry discovery on every scan.
      return discoveredModels;
    } finally {
      discoveryPromise = null;
    }
  })();

  return discoveryPromise;
}

// Build the attempt order for this key: configured -> best live model -> last resort.
async function resolveModelChain(client) {
  const available = await discoverModels(client);
  const chain = [];

  if (CONFIGURED_MODEL) chain.push(CONFIGURED_MODEL);

  if (available.length) {
    const best = PREFERRED_MODELS.find((m) => available.includes(m));
    // Fall back to whatever the key offers, preferring flash (fast, cheap).
    const anyFlash = available.find((m) => /flash/i.test(m));
    chain.push(best || anyFlash || available[0]);
    if (FALLBACK_MODEL && available.includes(FALLBACK_MODEL)) chain.push(FALLBACK_MODEL);
  } else {
    chain.push(DEFAULT_MODEL, FALLBACK_MODEL);
  }

  if (CONFIGURED_MODEL) {
    // The user pinned a model, so try it first and do not silently ignore it.
    console.log(`[vision] using GEMINI_MODEL=${CONFIGURED_MODEL} from .env`);
  }

  return chain.filter((m, i, arr) => m && arr.indexOf(m) === i);
}

// HTTP statuses worth retrying: the request was well-formed, the server was not
// ready. 400/401/403/404 mean we sent something wrong and retrying wastes time.
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Pull an HTTP status out of whatever the SDK threw. Different @google/genai
// versions surface it as error.status, error.code, or nested in the JSON body.
function statusOf(error) {
  const candidates = [
    error?.status,
    error?.code,
    error?.error?.code,
    error?.response?.status,
    // The SDK frequently embeds the raw error body inside message.
    Number(/"code"\s*:\s*(\d{3})/.exec(error?.message || '')?.[1]),
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isInteger(n) && n >= 400 && n < 600) return n;
  }
  return null;
}

function isRetryable(error) {
  const status = statusOf(error);
  if (status !== null) return RETRYABLE_STATUSES.has(status);
  // No parsable status: retry on the transient-looking phrases only.
  return /UNAVAILABLE|overloaded|high demand|deadline|timeout|ECONNRESET|ETIMEDOUT|fetch failed/i.test(
    error?.message || ''
  );
}

// The exact keys the front end reads, as a compact empty skeleton.
//
// This replaces a ~2.4 KB human-readable description of every field. Shipping a
// prose description of each key cost thousands of input tokens AND degraded
// identification: the model spends its capacity describing fields instead of
// looking at the leaf, so both latency and accuracy suffer. An empty skeleton
// pins the shape just as precisely for a fraction of the prompt.
const RESPONSE_TEMPLATE = {
  commonName: '',
  scientificName: '',
  family: '',
  confidence: 0,
  healthStatus: '',
  issue: '',
  severity: '',
  organScanned: '',
  growthStage: '',
  overview: '',
  appearance: '',
  medicinal: {
    constituents: '',
    uses: '',
    preparation: '',
    caution: '',
    evidence: '',
  },
  needs: {
    sunlight: '',
    watering: '',
    soil: '',
    temperature: '',
    humidity: '',
    fertilizer: '',
  },
  petSafety: {
    safe: false,
    status: '',
    note: '',
    symptoms: '',
    action: '',
  },
  household: '',
  ecosystem: '',
  treatment: '',
  prevention: '',
  derivedFrom: '',
};

function buildPrompt() {
  return [
    'You are LeafDex, a botanical vision system. Identify this plant from the photo and diagnose its health.',
    'Reply with ONLY JSON in exactly this shape (same keys, same nesting, no markdown):',
    JSON.stringify(RESPONSE_TEMPLATE),
    'Key meaning:',
    '- confidence: 0-100 integer. Only be above 90 when the species is unmistakable.',
    '- healthStatus: one of Healthy, Healthy / Minor Insect Activity, Stressed, Infected.',
    '- severity: e.g. "0% (Healthy)" or "45% (Moderate) — foliar lesion coverage".',
    '- organScanned / growthStage: which part the photo shows, and the plant stage.',
    '- overview / appearance: what the plant is, and the leaf features that identify it.',
    '- medicinal.constituents/uses/preparation/caution/evidence: active compounds; what it treats; how a remedy is made (quantities and timing); who must avoid it; honestly how strong the evidence is.',
    '- needs.*: care guidance including pH range and hard temperature limits.',
    '- petSafety.safe is a boolean; note names the toxin; symptoms and action are for the owner.',
    '- treatment: numbered steps, separate each step with a newline.',
    '- prevention / household / ecosystem: recurrence advice, other uses, wildlife role.',
    'Rules: be specific and practical; never invent drug dosages; if the image is not a plant, set commonName to "Unidentified specimen" and explain in issue.',
  ].join('\n');
}

// Strip ```json fences / stray text a model sometimes wraps around JSON.
function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Guarantee every field the UI reads exists, even if the model omits one.
// `petSafety` is accepted at the top level (current schema) or nested under
// `goodFor` (older responses), so cached or hand-written JSON still works.
function normalizeResult(raw) {
  const petSafety = raw?.petSafety || raw?.goodFor?.petSafety || {};
  const needs = raw?.needs || {};
  const medicinal = raw?.medicinal || {};
  const goodFor = raw?.goodFor || {};
  const confidence = Number(raw?.confidence);

  return {
    commonName: raw?.commonName || 'Unidentified specimen',
    scientificName: raw?.scientificName || 'Species unknown',
    family: raw?.family || 'Unknown family',
    confidence: Number.isFinite(confidence) ? Math.min(100, Math.max(0, confidence)) : 0,
    healthStatus: raw?.healthStatus || 'Unknown',
    issue: raw?.issue || 'No diagnosis available.',
    severity: raw?.severity || 'Unknown',
    organScanned: raw?.organScanned || 'Scanned specimen surface',
    growthStage: raw?.growthStage || '',
    overview: raw?.overview || '',
    appearance: raw?.appearance || '',
    needs: {
      sunlight: needs.sunlight || 'Not available.',
      watering: needs.watering || 'Not available.',
      soil: needs.soil || 'Not available.',
      temperature: needs.temperature || 'Not available.',
      humidity: needs.humidity || 'Not available.',
      fertilizer: needs.fertilizer || 'Not available.',
    },
    medicinal: {
      constituents: medicinal.constituents || 'Not available.',
      uses: medicinal.uses || goodFor.healing || 'Not available.',
      preparation: medicinal.preparation || 'Not available.',
      caution: medicinal.caution || 'No safety data returned — do not use internally.',
      evidence: medicinal.evidence || 'Evidence level not stated.',
    },
    petSafety: {
      safe: Boolean(petSafety.safe),
      status: petSafety.status || (petSafety.safe ? 'Safe for Dogs & Cats' : 'Toxicity unknown — exercise caution'),
      note: petSafety.note || 'No pet-safety data returned.',
      symptoms: petSafety.symptoms || 'No symptom list returned — watch for drooling, vomiting, or lethargy.',
      action: petSafety.action || 'Contact your vet or a pet poison line if a pet has chewed this plant.',
    },
    household: raw?.household || goodFor.household || 'Not available.',
    ecosystem: raw?.ecosystem || '',
    treatment: raw?.treatment || 'No treatment protocol provided.',
    prevention: raw?.prevention || '',
    derivedFrom: raw?.derivedFrom || 'Gemini vision analysis of the uploaded specimen.',
  };
}

/**
 * Analyze a plant image with Gemini.
 * @param {{ imageBase64: string, mimeType: string, fileName?: string }} params
 * @returns {Promise<{ configured: boolean, result?: object, message?: string }>}
 */
export async function analyzePlantImage({ imageBase64, mimeType, fileName }) {
  const client = getGenAI();
  if (!client) {
    return {
      configured: false,
      message: 'No GEMINI_API_KEY configured — server-side AI is disabled.',
    };
  }

  const request = (model) =>
    client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildPrompt() },
            { text: `Uploaded file name (may hint at the species): ${fileName || 'unknown'}` },
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
          ],
        },
      ],
      config: { temperature: 0.2, responseMimeType: 'application/json' },
    });

  let response;
  let lastError;

  const modelChain = await resolveModelChain(client);

  // One pass over the chain, plus a single short retry on the last model. Two
  // full rounds made a doomed scan wait ~6 attempts before reporting failure;
  // failing in about two is far better UX than waiting to fail.
  const RETRY_DELAY_MS = 700;

  outer: for (let pass = 0; pass < 2; pass += 1) {
    for (const model of modelChain) {
      // On the second pass only re-try the final (most likely to work) model.
      if (pass === 1 && model !== modelChain[modelChain.length - 1]) continue;
      try {
        response = await request(model);
        lastError = undefined;
        break outer;
      } catch (error) {
        lastError = error;
        // A bad key or malformed request fails on every model - stop at once.
        if (!isRetryable(error)) break outer;
        console.warn(
          `[vision] ${model} unavailable (${statusOf(error) ?? 'no status'}); trying next option.`
        );
      }
    }
    if (lastError && pass === 0) await sleep(RETRY_DELAY_MS);
  }

  if (lastError) {
    const detail = lastError?.message || String(lastError);
    const status = statusOf(lastError);

    if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED/i.test(detail)) {
      return {
        configured: true,
        message: `Gemini rejected the API key. Check GEMINI_API_KEY in .env. (${detail})`,
      };
    }

    if (status === 503 || /UNAVAILABLE|high demand|overloaded/i.test(detail)) {
      return {
        configured: true,
        message:
          'Gemini is temporarily overloaded (503) and the fallback models were busy too. ' +
          'This is a capacity spike on Google\u2019s side, not a problem with your photo or API key \u2014 ' +
          'try the scan again in a moment.',
      };
    }

    if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(detail)) {
      return {
        configured: true,
        message:
          'Gemini rate limit or free-tier quota reached for this API key. Wait a minute, or check the ' +
          'quota for GEMINI_API_KEY in Google AI Studio.',
      };
    }

    if (status === 400 || status === 404) {
      return {
        configured: true,
        message:
          `Gemini rejected the request (${status}). The model "${modelChain[0]}" may not be available to ` +
          `this API key. Set GEMINI_MODEL in .env to a model your key can use. (${detail})`,
      };
    }

    return { configured: true, message: `Gemini request failed: ${detail}` };
  }

  const text = response?.text || '';
  const parsed = extractJson(text);
  if (!parsed) {
    return {
      configured: true,
      message: 'The AI model returned a response that could not be parsed.',
    };
  }

  return { configured: true, result: normalizeResult(parsed) };
}
