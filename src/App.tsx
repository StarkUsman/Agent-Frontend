import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import AgentsPage from './pages/AgentsPage'
import CallHistoryPage from './pages/CallHistoryPage'
import ReportsPage from './pages/ReportsPage'
import FlowEditorPage from './pages/FlowEditorPage'
import CreateAgentPage from './pages/CreateAgentPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/new" element={<CreateAgentPage />} />
        <Route path="/calls" element={<CallHistoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/agents/:id/flow" element={<FlowEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
