import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { CurrentUserProvider } from './contexts/CurrentUserContext'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import AgentsPage from './pages/AgentsPage'
import CallHistoryPage from './pages/CallHistoryPage'
import ReportsPage from './pages/ReportsPage'
import FlowEditorPage from './pages/FlowEditorPage'
import CreateAgentPage from './pages/CreateAgentPage'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'

const App = () => {
  return (
    <ThemeProvider>
      <CurrentUserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/new" element={<CreateAgentPage />} />
            <Route path="/calls" element={<CallHistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/agents/:id/flow" element={<FlowEditorPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<CreateUserPage />} />
            <Route path="/users/:id/edit" element={<CreateUserPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrentUserProvider>
    </ThemeProvider>
  )
}

export default App
