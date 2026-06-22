import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { listAgents, type ManagerAgent, type AgentPagination } from '../api/manager'

interface AgentsContextValue {
  agents:       ManagerAgent[]
  runningCount: number
  loading:      boolean
  error:        string | null
  pagination:   AgentPagination
  setPage:      (page: number) => void
  refresh:      () => void
}

const DEFAULT_PAGINATION: AgentPagination = { total: 0, limit: 25, page: 1, totalPages: 1 }

const AgentsContext = createContext<AgentsContextValue | null>(null)

export const AgentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [agents,     setAgents]     = useState<ManagerAgent[]>([])
  const [pagination, setPagination] = useState<AgentPagination>(DEFAULT_PAGINATION)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [page,       setPageState]  = useState(1)

  const load = useCallback(async (targetPage: number) => {
    setLoading(true)
    try {
      const res = await listAgents(targetPage, DEFAULT_PAGINATION.limit)
      setAgents(res.data)
      setPagination(res.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [page, load])

  const setPage = (p: number) => setPageState(p)
  const refresh = () => load(page)

  const runningCount = agents.filter((a) => a.status === 'running').length

  return (
    <AgentsContext.Provider value={{ agents, runningCount, loading, error, pagination, setPage, refresh }}>
      {children}
    </AgentsContext.Provider>
  )
}

export const useAgents = (): AgentsContextValue => {
  const ctx = useContext(AgentsContext)
  if (!ctx) throw new Error('useAgents must be used inside <AgentsProvider>')
  return ctx
}
