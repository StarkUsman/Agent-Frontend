import { createContext, useContext, useEffect, useState } from 'react'
import { listAgents, type ManagerAgent } from '../api/manager'

interface AgentsContextValue {
  agents:       ManagerAgent[]
  runningCount: number
  loading:      boolean
  error:        string | null
  refresh:      () => void
}

const AgentsContext = createContext<AgentsContextValue | null>(null)

export const AgentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [agents,  setAgents]  = useState<ManagerAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await listAgents()
      setAgents(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const runningCount = agents.filter((a) => a.status === 'running').length

  return (
    <AgentsContext.Provider value={{ agents, runningCount, loading, error, refresh: load }}>
      {children}
    </AgentsContext.Provider>
  )
}

export const useAgents = (): AgentsContextValue => {
  const ctx = useContext(AgentsContext)
  if (!ctx) throw new Error('useAgents must be used inside <AgentsProvider>')
  return ctx
}
