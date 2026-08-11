// app/dashboard/calendar/page.tsx
"use client";

import React, { useState } from "react";

// ISOLATED FUNCTION: Mock Calendar Grid Cell
function CalendarCell({ date, isCurrentMonth, posts }: { date: number, isCurrentMonth: boolean, posts?: any[] }) {
  return (
    <div className={`min-h-[140px] p-2 border-r border-b border-slate-200 transition-colors hover:bg-slate-50 ${
      isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-sm font-medium ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}`}>
          {date}
        </span>
      </div>
      
      {/* Post Pills (Color-coded by platform) */}
      <div className="space-y-2">
        {posts?.map((post, idx) => (
          <div 
            key={idx} 
            draggable
            className={`text-xs px-2 py-1.5 rounded-lg font-medium cursor-grab active:cursor-grabbing border shadow-sm ${
              post.platform === 'IG' 
                ? 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' 
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{post.platform}</span>
              <span>{post.time}</span>
            </div>
            <div className="truncate mt-0.5 opacity-80 font-normal">{post.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ISOLATED FUNCTION: Main Calendar Screen
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("August 2026");
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock data to demonstrate color-coding (Requirement from Scope Document)
  const mockPostsDay15 = [
    { platform: 'IG', time: '10:00 AM', title: 'Product Launch' },
    { platform: 'IN', time: '02:00 PM', title: 'CEO Thoughts' }
  ];
  
  const mockPostsDay18 = [
    { platform: 'IG', time: '06:00 PM', title: 'Behind the scenes' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Calendar</h1>
          {/* Timezone Indicator (Requirement from Scope Document) */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">Workspace timezone:</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              GMT+05:00 (Karachi)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <button className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 border-r border-slate-300 transition-colors">◀</button>
            <div className="px-4 py-1.5 text-sm font-bold text-slate-900 bg-slate-50 flex items-center">
              {currentMonth}
            </div>
            <button className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 border-l border-slate-300 transition-colors">▶</button>
          </div>
          <button className="bg-[#FF6B4A] hover:bg-[#E85A38] text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
            + Schedule Post
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
        
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-50">
          {daysOfWeek.map(day => (
            <div key={day} className="px-2 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells (Static mock for UI purposes) */}
        <div className="grid grid-cols-7">
          {/* Previous Month Padding */}
          <CalendarCell date={26} isCurrentMonth={false} />
          <CalendarCell date={27} isCurrentMonth={false} />
          <CalendarCell date={28} isCurrentMonth={false} />
          <CalendarCell date={29} isCurrentMonth={false} />
          <CalendarCell date={30} isCurrentMonth={false} />
          <CalendarCell date={31} isCurrentMonth={false} />
          
          {/* Current Month Days (1 to 31) */}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
            // Injecting mock posts into specific days
            let posts = undefined;
            if (date === 15) posts = mockPostsDay15;
            if (date === 18) posts = mockPostsDay18;

            return (
              <CalendarCell 
                key={date} 
                date={date} 
                isCurrentMonth={true} 
                posts={posts} 
              />
            );
          })}
          
          {/* Next Month Padding */}
          <CalendarCell date={1} isCurrentMonth={false} />
          <CalendarCell date={2} isCurrentMonth={false} />
          <CalendarCell date={3} isCurrentMonth={false} />
          <CalendarCell date={4} isCurrentMonth={false} />
          <CalendarCell date={5} isCurrentMonth={false} />
        </div>
        
      </div>
    </div>
  );
}