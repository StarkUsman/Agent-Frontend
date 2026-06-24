// REST client for the pipecat-flows multi-agent manager (manager.py).
//
// GET /agents and GET /agents/:id are served by the calls API (VITE_CALLS_URL).
// All mutations (POST, PUT, DELETE) go to the manager API (VITE_MANAGER_URL).

const BASE_URL = (
  (import.meta.env.VITE_MANAGER_URL as string | undefined) ?? "http://84.46.251.98:8080"
).replace(/\/+$/, "");

const LIST_BASE_URL = (
  (import.meta.env.VITE_CALLS_URL as string | undefined) ?? "http://localhost:8790"
).replace(/\/+$/, "");

export type AgentStatus = "running" | "inactive";

// Which manager pipeline an agent runs on: a classic STT→LLM→TTS "pipeline"
// agent (routes under "") or a realtime speech-to-speech "s2s" agent (routes
// under "/STS"). The list API tags each agent with this discriminator.
export type AgentKind = "pipeline" | "s2s";

export interface ManagerAgent {
  id: string;
  name: string;
  port: number;
  config: Record<string, string>;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  flow_api_port: number;
  kind?: AgentKind;
}

// Manager route prefix for a given agent kind. S2S agents live under /STS.
const prefix = (kind: AgentKind = "pipeline"): string =>
  kind === "s2s" ? "/STS" : "";

// Resolve an agent's kind, falling back to its config if the list API didn't
// tag it (e.g. an older backend).
export function agentKindOf(agent: Pick<ManagerAgent, "kind" | "config">): AgentKind {
  return agent.kind ?? (agent.config?.S2S_PROVIDER ? "s2s" : "pipeline");
}

export interface AgentDetail extends ManagerAgent {
  client_url: string;
}

export interface CreateAgentBody {
  name: string;
  flow_code: string;
  config: Record<string, string>;
}

export interface CreateAgentResponse {
  id: string;
  name: string;
  port: number;
  status: AgentStatus;
  client_url: string;
  created_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body — keep the status line
    }
    throw new Error(message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function requestList<T>(path: string): Promise<T> {
  const res = await fetch(`${LIST_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body — keep the status line
    }
    throw new Error(message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export interface AgentPagination {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface AgentListResponse {
  data: ManagerAgent[];
  pagination: AgentPagination;
}

export function listAgents(
  page = 1,
  limit = 25,
  search?: string,
  status?: string,
  kind?: AgentKind,
): Promise<AgentListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("name", search.trim());
  if (status)         params.set("status", status);
  if (kind)           params.set("kind", kind);
  return requestList<AgentListResponse>(`/api/agents?${params.toString()}`);
}

export function getAgent(id: string): Promise<AgentDetail> {
  return requestList<AgentDetail>(`/api/agents/${id}`);
}

// The flow editor only knows an agent id, not its kind. When kind is omitted we
// try the pipeline route and fall back to the s2s route on failure.
export async function getAgentFlow(id: string, kind?: AgentKind): Promise<{ flow_code: string }> {
  if (kind) return request<{ flow_code: string }>(`${prefix(kind)}/agents/${id}/flow`);
  try {
    return await request<{ flow_code: string }>(`/agents/${id}/flow`);
  } catch {
    return await request<{ flow_code: string }>(`/STS/agents/${id}/flow`);
  }
}

export function createAgent(body: CreateAgentBody, kind: AgentKind = "pipeline"): Promise<CreateAgentResponse> {
  return request<CreateAgentResponse>(`${prefix(kind)}/agents`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Provider catalog (GET /providers) ───────────────────────────────────────
// Mirrors services.PROVIDER_CATALOG on the manager. Models/voices are advisory:
// the backend accepts any string, so the UI allows free-text alongside these.
export interface CatalogVoice {
  id: string;
  name: string;
  gender?: string;
  accent?: string;
  description?: string;
}

export interface CatalogProvider {
  id: string;
  label: string;
  apiKeyEnv: string | null;
  baseUrl?: string;
  models?: string[];
  voices?: CatalogVoice[];
}

export interface ProviderCatalog {
  stt: CatalogProvider[];
  llm: CatalogProvider[];
  tts: CatalogProvider[];
  // Speech-to-speech realtime providers (GET /STS/providers). Flat list — each
  // provider bundles STT+LLM+TTS, so one entry drives the whole agent.
  s2s: CatalogProvider[];
}

export function getProviders(): Promise<Omit<ProviderCatalog, "s2s">> {
  return request<Omit<ProviderCatalog, "s2s">>("/providers");
}

// GET /STS/providers returns a flat array of realtime providers.
export function getS2sProviders(): Promise<CatalogProvider[]> {
  return request<CatalogProvider[]>("/STS/providers");
}

export async function updateAgentFlow(
  id: string,
  flowCode: string,
  kind?: AgentKind
): Promise<{ status: string; message: string }> {
  const body = JSON.stringify({ flow_code: flowCode });
  if (kind) {
    return request(`${prefix(kind)}/agents/${id}/flow`, { method: "PUT", body });
  }
  // Kind unknown (flow editor): try pipeline, fall back to s2s. Retrying a PUT
  // is safe — a 404 means nothing was modified in that table.
  try {
    return await request(`/agents/${id}/flow`, { method: "PUT", body });
  } catch {
    return await request(`/STS/agents/${id}/flow`, { method: "PUT", body });
  }
}

export function activateAgent(id: string, kind: AgentKind = "pipeline"): Promise<{ status: string; client_url: string }> {
  return request(`${prefix(kind)}/agents/${id}/activate`, { method: "PUT" });
}

export function deactivateAgent(id: string, kind: AgentKind = "pipeline"): Promise<{ status: string; message: string }> {
  return request(`${prefix(kind)}/agents/${id}/deactivate`, { method: "PUT" });
}

export interface UpdateAgentBody {
  name?:   string;
  config?: Record<string, string>;
}

export function updateAgent(id: string, body: UpdateAgentBody, kind: AgentKind = "pipeline"): Promise<ManagerAgent> {
  return request<ManagerAgent>(`${prefix(kind)}/agents/${id}/config`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteAgent(id: string, kind: AgentKind = "pipeline"): Promise<{ status: string }> {
  return request(`${prefix(kind)}/agents/${id}`, { method: "DELETE" });
}

// The /agents list returns `port` but not `client_url`; build it from the
// manager host so the table can link straight to each agent's client page.
export function agentClientUrl(port: number): string {
  let host = "localhost";
  try {
    host = new URL(BASE_URL).hostname;
  } catch {
    // keep default
  }
  return `http://${host}:${port}/client`;
}
