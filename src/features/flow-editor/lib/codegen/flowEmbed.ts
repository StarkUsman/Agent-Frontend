import { FlowJson } from "@/lib/schema/flow.schema";

// The backend stores the generated Python (flow.py); the editor only converts
// JSON -> Python. To reload an existing flow we carry the source FlowJson along
// inside the Python as a single base64 comment line. It compiles fine as a
// comment and round-trips losslessly.

const MARKER = "# pipecat-flow-json:";

function encode(json: FlowJson): string {
  // UTF-8 safe base64 (flow text may contain non-Latin1 characters).
  return btoa(unescape(encodeURIComponent(JSON.stringify(json))));
}

function decode(b64: string): unknown {
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

export function embedFlowJsonInPython(python: string, flow: FlowJson): string {
  // Drop any previous marker so deploys don't accumulate stale copies.
  const stripped = python
    .split("\n")
    .filter((line) => !line.startsWith(MARKER))
    .join("\n");
  return `${MARKER}${encode(flow)}\n${stripped}`;
}

export function extractFlowJsonFromPython(python: string): FlowJson | null {
  const line = python.split("\n").find((l) => l.startsWith(MARKER));
  if (!line) return null;
  try {
    return decode(line.slice(MARKER.length).trim()) as FlowJson;
  } catch {
    return null;
  }
}
