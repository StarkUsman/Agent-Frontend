import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { CurrentUserProvider } from './contexts/CurrentUserContext'
import { AgentsProvider } from './contexts/AgentsContext'
import ProtectedRoute from './components/ProtectedRoute'
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
          <AgentsProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
            <Route path="/agents/new" element={<ProtectedRoute permission="agents:create" fallback="/agents"><CreateAgentPage /></ProtectedRoute>} />
            <Route path="/calls" element={<ProtectedRoute><CallHistoryPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/agents/:id/flow" element={<ProtectedRoute><FlowEditorPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute permission="users:manage" fallback="/users"><CreateUserPage /></ProtectedRoute>} />
            <Route path="/users/:id/edit" element={<ProtectedRoute permission="users:manage" fallback="/users"><CreateUserPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AgentsProvider>
        </BrowserRouter>
      </CurrentUserProvider>
    </ThemeProvider>
  )
}

export default App
