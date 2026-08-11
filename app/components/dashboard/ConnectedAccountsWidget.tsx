// components/dashboard/ConnectedAccountsWidget.tsx
import React from 'react';

// ISOLATED FUNCTION: Renders a single connected account
function AccountItem({ platform, handle, isConnected, expireWarning }: { platform: string, handle: string, isConnected: boolean, expireWarning?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center font-bold text-slate-600 text-sm">
          {platform.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">{platform}</p>
            {/* Health Status Dot: Amber for warning, Sage for healthy */}
            <div className={`w-2 h-2 rounded-full ${expireWarning ? 'bg-[#E8912D]' : 'bg-[#3D9970]'}`}></div>
          </div>
          <p className="text-xs text-slate-500">{handle}</p>
        </div>
      </div>
      <span className={`text-xs font-medium ${expireWarning ? 'text-[#E8912D]' : 'text-[#3D9970]'}`}>
        {expireWarning || 'Connected'}
      </span>
    </div>
  );
}

// ISOLATED FUNCTION: Main Accounts Widget
export default function ConnectedAccountsWidget() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Connected Accounts</h3>
        <button className="text-sm text-[#FF6B4A] hover:underline font-medium">+ Add</button>
      </div>
      
      <div className="flex-1">
        <AccountItem platform="Instagram" handle="@northbeamstudio" isConnected={true} />
        <AccountItem platform="LinkedIn" handle="Northbeam Studio" isConnected={true} expireWarning="Token expires in 5 days" />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
         <p className="text-xs text-slate-500">Connect X, Facebook, or TikTok to publish everywhere from one queue.</p>
      </div>
    </div>
  );
}