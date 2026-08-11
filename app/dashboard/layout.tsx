// app/dashboard/layout.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions"; // Apna alias path verify karlena agar zaroorat ho
import Sidebar from "../components/dashboard/Sidebar";
import TopBar from "../components/dashboard/TopBar";

// ISOLATED FUNCTION: Protected Dashboard Layout
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]"> 
      {/* Injected Sidebar Component */}
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Injected TopBar Component */}
        <TopBar />

        {/* DYNAMIC PAGE CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}