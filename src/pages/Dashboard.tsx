import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsRow from '../components/dashboard/StatsRow'
import LiveCallsSection from '../components/dashboard/LiveCallsSection'
import AgentsGrid from '../components/dashboard/AgentsGrid'

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* Left: fixed sidebar */}
      <Sidebar />

      {/* Right: header fixed + content scrolls */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar — never scrolls */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <DashboardHeader />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pb-3 pt-5 space-y-4">

          {/* Step 3 ✓ */}
          <StatsRow />

          {/* Step 4 ✓ */}
          <LiveCallsSection />

          {/* Step 5 ✓ */}
          <AgentsGrid />

        </div>
      </main>

    </div>
  )
}

export default Dashboard
