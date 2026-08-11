// app/dashboard/page.tsx
import StatCard from "../components/dashboard/StatCard";
import RecentActivityFeed from "../components/dashboard/RecentActivityFeed";
import ConnectedAccountsWidget from "../components/dashboard/ConnectedAccountsWidget";

// ISOLATED FUNCTION: Main Dashboard View
export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <button className="bg-[#FF6B4A] hover:bg-[#E85A38] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          + Generate New Post
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Upcoming Posts" value="24" subtitle="Next goes out today at 3:00 PM" />
        <StatCard title="Pending Approvals" value="7" subtitle="2 overdue by 48h+" isWarning={true} />
        <StatCard title="This Week's Engagement" value="13,980" subtitle="↗ 12.4% vs last week" />
        <StatCard title="AI Credits Used" value="340/500" subtitle="Resets in 11 days" />
      </div>

      {/* LOWER SECTION (Real Components Injected) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yahan tumhari RecentActivityFeed machine fit ho gayi */}
        <div className="lg:col-span-2 h-[420px]">
          <RecentActivityFeed />
        </div>
        {/* Yahan ConnectedAccountsWidget fit ho gaya */}
        <div className="h-[420px]">
          <ConnectedAccountsWidget />
        </div>
      </div>

    </div>
  );
}