import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { listAgents, type AgentKind, type ManagerAgent, type AgentPagination } from '../api/manager'

interface AgentFilters {
  search: string
  status: string     // '' | 'running' | 'inactive'
  kind:   AgentKind | ''
}

interface AgentsContextValue {
  agents:       ManagerAgent[]
  runningCount: number
  loading:      boolean
  error:        string | null
  pagination:   AgentPagination
  filters:      AgentFilters
  setPage:      (page: number) => void
  setFilters:   (filters: Partial<AgentFilters>) => void
  refresh:      () => void
}

const DEFAULT_PAGINATION: AgentPagination = { total: 0, limit: 25, page: 1, totalPages: 1 }
const DEFAULT_FILTERS: AgentFilters = { search: '', status: '', kind: '' }

const AgentsContext = createContext<AgentsContextValue | null>(null)

export const AgentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [agents,     setAgents]     = useState<ManagerAgent[]>([])
  const [pagination, setPagination] = useState<AgentPagination>(DEFAULT_PAGINATION)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [page,       setPageState]  = useState(1)
  const [filters,    setFiltersState] = useState<AgentFilters>(DEFAULT_FILTERS)

  const load = useCallback(async (targetPage: number, f: AgentFilters) => {
    setLoading(true)
    try {
      const res = await listAgents(targetPage, DEFAULT_PAGINATION.limit, f.search, f.status, f.kind || undefined)
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
    load(page, filters)
  }, [page, filters, load])

  const setPage = (p: number) => setPageState(p)

  const setFilters = (partial: Partial<AgentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }))
    setPageState(1)
  }

  const refresh = () => load(page, filters)

  const runningCount = agents.filter((a) => a.status === 'running').length

  return (
    <AgentsContext.Provider value={{ agents, runningCount, loading, error, pagination, filters, setPage, setFilters, refresh }}>
      {children}
    </AgentsContext.Provider>
  )
}

export const useAgents = (): AgentsContextValue => {
  const ctx = useContext(AgentsContext)
  if (!ctx) throw new Error('useAgents must be used inside <AgentsProvider>')
  return ctx
}
