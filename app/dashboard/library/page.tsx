"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ISOLATED FUNCTION: Single Post Card with 3-Dot Menu
function PostCard({ id, status, platform, content, date, onDelete, onSchedule, onEdit }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${ platform === 'IG' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600' }`}>
        {platform}
      </div>
      
      <div className="flex-1">
        <p className="text-sm text-slate-900 font-medium line-clamp-2 leading-relaxed">{content}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{status}</span>
          <span className="text-xs text-slate-400 font-medium">{date}</span>
        </div>
      </div>
      
      {/* 3-DOT MENU ACTION */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-slate-400 hover:text-slate-600 p-2 text-xl font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          ⋮
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 shadow-lg rounded-xl z-10 overflow-hidden flex flex-col">
             <button 
              onClick={() => { onEdit(id); setIsMenuOpen(false); }}
              className="text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            {status === 'Draft' && (
              <button 
                onClick={() => { onSchedule(id); setIsMenuOpen(false); }}
                className="text-left px-4 py-2 text-sm font-medium text-[#3D9970] hover:bg-[#ebf5f0]"
              >
                Schedule
              </button>
            )}
            <button 
              onClick={() => { onDelete(id); setIsMenuOpen(false); }}
              className="text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN PAGE COMPONENT
export default function ContentLibraryPage() {
  const { data: session, status } = useSession(); // status bhi zaroori hai wait karne ke liye
  // NAYA: Scheduling Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Drafts");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // NAYA: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const tabs = ["Drafts", "Scheduled", "Published"];

  useEffect(() => {
    // Jab tab change ho toh wapis page 1 par le aao
    setCurrentPage(1);
  }, [activeTab]);

useEffect(() => {
    const fetchPosts = async () => {
      // Agar user login nahi hai ya session load ho raha hai, toh wait karo
      const tenantId = (session?.user as any)?.id;
      if (status === "loading" || !tenantId) return;

      try {
        // NAYA: URL mein query parameter (tenantId) bhej rahe hain
        const res = await fetch(`http://localhost:5000/api/posts?tenantId=${tenantId}`);
        const data = await res.json();
        if (res.ok) setPosts(data.posts);
      } catch (error) {
        console.error("Failed to fetch posts");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [session, status]); // Dependency array mein inko add karna lazmi hai

  const handleDeletePost = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) setPosts(posts.filter(post => post._id !== id));
    } catch (error) { alert("Delete karne mein masla aya."); }
  };

// Modal Open Karne Wala Function
  const handleSchedulePost = (id: string) => {
    setSelectedPostId(id);
    setIsScheduleModalOpen(true);
  };

  // Asli Database call jo Date/Time bhejegi
  const confirmSchedule = async () => {
    if (!selectedPostId || !scheduleDate || !scheduleTime) {
      alert("Please select both Date and Time!");
      return;
    }
    
    // Date aur Time ko combine karke ISO string banana
    const dateTimeString = `${scheduleDate}T${scheduleTime}`; 

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${selectedPostId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Scheduled",
          scheduledTime: dateTimeString 
        })
      });
      
     if (res.ok) {
        // NAYA FIX: State update mein scheduledTime bhi update kar rahe hain
        setPosts(posts.map(post => 
          post._id === selectedPostId 
            ? { ...post, status: "Scheduled", scheduledTime: dateTimeString } 
            : post
        ));
        setIsScheduleModalOpen(false); 
        setScheduleDate(""); 
        setScheduleTime(""); 
      }
    } catch (error) { alert("Status update karne mein masla aya."); }
  };

  // NAYA: Routing to Edit Page with ID
  const handleEditPost = (id: string) => {
    router.push(`/dashboard/editor?editId=${id}`);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesTab = post.status === activeTab.replace(/s$/, '') || (activeTab === "Drafts" && post.status === "Draft");
    const matchesSearch = post.textContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // NAYA: Pagination Logic Math
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Library</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all your generated and scheduled posts.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/editor')}
          className="bg-[#FF6B4A] hover:bg-[#E85A38] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Generate New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col md:flex-row justify-between items-center gap-4">
         {/* Tabs and Search Bar Logic remains same */}
         <div className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-100 w-full md:w-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${ activeTab === tab ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700" }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex w-full md:w-auto gap-3 px-2 md:px-0">
          <input type="text" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 px-4 py-2 text-sm text-slate-900 placeholder-slate-500 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#FF6B4A]" />
        </div>
      </div>

     <div className="space-y-4">
        {isLoading ? (
           <div className="text-center py-10 text-slate-500">Loading posts...</div>
        ) : currentPosts.length > 0 ? (
          currentPosts.map((post: any) => {
            
            // NAYA FIX: Smart Date Logic
            // Agar post Scheduled hai aur usme scheduledTime hai, toh wo dikhao, warna createdAt dikhao
            const displayDate = post.status === 'Scheduled' && post.scheduledTime 
              ? new Date(post.scheduledTime).toLocaleString() 
              : new Date(post.createdAt).toLocaleString();

            return (
              <PostCard 
                key={post._id} 
                id={post._id} 
                status={post.status} 
                platform={post.platform} 
                content={post.textContent} 
                date={displayDate} // Yahan displayDate pass kar diya
                onDelete={handleDeletePost} 
                onSchedule={handleSchedulePost} 
                onEdit={handleEditPost}
              />
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">No posts found.</p>
          </div>
        )}
      </div>

      {/* NAYA: Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-2xl border border-slate-200">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50 hover:bg-slate-200 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* SCHEDULING MODAL (Popup) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule Post</h3>
            <p className="text-sm text-slate-500 mb-6">Select the exact date and time you want this post to go live.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={scheduleDate} 
                  onChange={(e) => setScheduleDate(e.target.value)} 
                  // FIX: text-slate-900 aur bg-white add kiya for high visibility
                  className="w-full px-4 py-2 text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-[#3D9970] focus:border-[#3D9970] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input 
                  type="time" 
                  value={scheduleTime} 
                  onChange={(e) => setScheduleTime(e.target.value)} 
                  // FIX: text-slate-900 aur bg-white add kiya for high visibility
                  className="w-full px-4 py-2 text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-[#3D9970] focus:border-[#3D9970] outline-none" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmSchedule} className="px-4 py-2 text-sm font-bold text-white bg-[#3D9970] hover:bg-[#2d7a59] rounded-lg transition-colors shadow-sm">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}