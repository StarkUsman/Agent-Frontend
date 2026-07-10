// Resolves config values at runtime (from window.__ENV__, injected by the
// Docker entrypoint via /config.js) with a fallback to build-time Vite env
// vars for local dev, then a hardcoded default.

declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>
  }
}

function readEnv(key: string, fallback: string): string {
  const runtimeValue = typeof window !== 'undefined' ? window.__ENV__?.[key] : undefined
  const buildTimeValue = import.meta.env[key] as string | undefined
  return (runtimeValue || buildTimeValue || fallback).replace(/\/+$/, '')
}

export const MANAGER_URL = readEnv('VITE_MANAGER_URL', 'http://84.46.251.98:8080')
export const CALLS_URL = readEnv('VITE_CALLS_URL', 'http://localhost:8790')
