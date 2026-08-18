// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ISOLATED FUNCTION: Grouped Dashboard Sidebar Navigation
export default function Sidebar() {
  const pathname = usePathname();

  // Navigation Links Data (Grouped for maximum UI Clarity & Ease of Use)
  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: "🏠" },
        { name: "Content Library", path: "/dashboard/library", icon: "📚" },
        { name: "Calendar", path: "/dashboard/calendar", icon: "📅" },
        { name: "Approvals", path: "/dashboard/approvals", icon: "✓", badge: "7" },
        { name: "Analytics", path: "/dashboard/analytics", icon: "📊" },
      ]
    },
    {
      title: "WORKSPACE SETTINGS",
      items: [
        { name: "General", path: "/dashboard/settings/general", icon: "⚙️" },
        { name: "Brand Profile", path: "/dashboard/settings/brand", icon: "✨" },
        { name: "Social Accounts", path: "/dashboard/settings", icon: "🔗" },
        { name: "Billing", path: "/dashboard/billing", icon: "💳" },
        { name: "Team & Roles", path: "/dashboard/settings/team", icon: "👥" },
      ]
    },
    {
      title: "EMAIL OUTREACH",
      items: [
        { name: "Reply Inbox", path: "/dashboard/email/inbox", icon: "📥", badge: "New" },
        { name: "Mailboxes", path: "/dashboard/email/mailboxes", icon: "📬" },
        { name: "Leads Upload", path: "/dashboard/email/leads", icon: "👥" },
        { name: "Sequences", path: "/dashboard/email/sequences", icon: "✉️" },
        { name: "Suppression List", path: "/dashboard/email/suppression", icon: "🚫" },
        { name: "Analytics", path: "/dashboard/email/analytics", icon: "📊" },
      ]
    },
  ];
  

  return (
    <aside className="w-64 bg-[#181825] text-white hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      {/* Logo Section */}
      <div className="p-6 font-bold text-xl flex items-center gap-3 sticky top-0 bg-[#181825] z-10">
        <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
          <span className="text-[#FF6B4A] text-sm font-black">A</span>
        </div>
        <span className="tracking-wide">AutoPost AI</span>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 px-4 space-y-6 pb-6">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-[#FF6B4A] text-white font-medium shadow-md shadow-[#FF6B4A]/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {/* Optional Badge */}
                    {item.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Trial Status Footer */}
      <div className="p-4 mx-4 mb-6 mt-auto rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#E8912D] animate-pulse"></div>
          <p className="text-xs text-[#E8912D] font-bold uppercase tracking-wider">Trial ends in 6 days</p>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">Upgrade to keep your automations running smoothly.</p>
        <Link href="/dashboard/billing" className="text-sm font-medium text-white hover:text-[#FF6B4A] transition-colors flex items-center gap-1">
          View plans <span>→</span>
        </Link>
      </div>
    </aside>
  );
}