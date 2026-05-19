import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'

const Dashboard = () => {
  const navigate = useNavigate()

  // Guard: redirect unauthenticated users to login
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Left: fixed sidebar */}
      <Sidebar />

      {/* Right: scrollable main content */}
      <main className="flex-1 overflow-y-auto">

        {/* Step 2 ✓ */}
        <DashboardHeader />

        {/* Steps 3–7 will stack here inside this padding wrapper */}
        <div className="px-8 pb-8 space-y-8">

          {/* Placeholder — Step 3 replaces this with stats cards */}
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-300 text-sm font-medium">
              Step 3 → Stats cards coming next
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}

export default Dashboard
