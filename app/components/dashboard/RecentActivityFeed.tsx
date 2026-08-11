// components/dashboard/RecentActivityFeed.tsx
import React from 'react';

// ISOLATED FUNCTION: Renders a single activity item
function ActivityItem({ icon, title, subtitle, time, status }: { icon: React.ReactNode, title: string, subtitle: string, time: string, status: 'success' | 'warning' | 'neutral' }) {
  // Design System Rules applied here
  const statusColors = {
    success: 'text-[#3D9970] bg-[#3D9970]/10', // Sage Green
    warning: 'text-[#E8912D] bg-[#E8912D]/10', // Amber
    neutral: 'text-slate-500 bg-slate-100'     // Gray
  };

  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full flex items-center justify-center w-8 h-8 ${statusColors[status]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

// ISOLATED FUNCTION: Main Feed Component
export default function RecentActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
        <button className="text-sm text-[#FF6B4A] hover:underline font-medium">View all</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
         {/* Static Mock Data (Later to be replaced by Backend API) */}
         <ActivityItem 
           status="success" 
           icon={<span className="text-sm">✓</span>} 
           title="Post approved by Priya Nair" 
           subtitle="LinkedIn thought-leadership post scheduled for Thu 9:00 AM" 
           time="48 min ago" 
         />
         <ActivityItem 
           status="warning" 
           icon={<span className="text-sm">!</span>} 
           title="Publish retried" 
           subtitle="Instagram rate limit hit — post went out on the second attempt" 
           time="Yesterday, 4:12 PM" 
         />
         <ActivityItem 
           status="neutral" 
           icon={<span className="text-sm">💬</span>} 
           title="Comment from Marcus Webb" 
           subtitle='"Can we soften the CTA on the second slide?"' 
           time="Yesterday, 1:30 PM" 
         />
      </div>
    </div>
  );
}