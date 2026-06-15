// REST client for the pipecat-flows multi-agent manager (manager.py).
//
// Base URL is read from VITE_MANAGER_URL and defaults to the manager's
// documented local port. The manager serves permissive CORS ("*").

const BASE_URL = (
  (import.meta.env.VITE_MANAGER_URL as string | undefined) ?? "http://84.46.251.98:8080"
).replace(/\/+$/, "");

export type AgentStatus = "running" | "inactive";

export interface ManagerAgent {
  id: string;
  name: string;
  port: number;
  status: AgentStatus;
  created_at: string;
}

export interface AgentDetail extends ManagerAgent {
  flow_api_port: number;
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
  // Some endpoints (DELETE) may return an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function listAgents(): Promise<ManagerAgent[]> {
  return request<ManagerAgent[]>("/agents");
}

export function getAgent(id: string): Promise<AgentDetail> {
  return request<AgentDetail>(`/agents/${id}`);
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
