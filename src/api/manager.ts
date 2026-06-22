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

export interface ManagerAgent {
  id: string;
  name: string;
  port: number;
  config: Record<string, string>;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  flow_api_port: number;
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
): Promise<AgentListResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("name", search.trim());
  if (status)         params.set("status", status);
  return requestList<AgentListResponse>(`/api/agents?${params.toString()}`);
}

export function getAgent(id: string): Promise<AgentDetail> {
  return requestList<AgentDetail>(`/api/agents/${id}`);
}

export function getAgentFlow(id: string): Promise<{ flow_code: string }> {
  return request<{ flow_code: string }>(`/agents/${id}/flow`);
}

export function createAgent(body: CreateAgentBody): Promise<CreateAgentResponse> {
  return request<CreateAgentResponse>("/agents", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAgentFlow(
  id: string,
  flowCode: string
): Promise<{ status: string; message: string }> {
  return request(`/agents/${id}/flow`, {
    method: "PUT",
    body: JSON.stringify({ flow_code: flowCode }),
  });
}

export function activateAgent(id: string): Promise<{ status: string; client_url: string }> {
  return request(`/agents/${id}/activate`, { method: "PUT" });
}

export function deactivateAgent(id: string): Promise<{ status: string; message: string }> {
  return request(`/agents/${id}/deactivate`, { method: "PUT" });
}

export function deleteAgent(id: string): Promise<{ status: string }> {
  return request(`/agents/${id}`, { method: "DELETE" });
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
