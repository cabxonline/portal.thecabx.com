"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Settings } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname.split("/").filter(Boolean);
  const currentPage = paths[paths.length - 1] || 'Dashboard';

  const [newCount, setNewCount] = useState(0);
  const latestIdRef = useRef(0);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const pollBookings = async () => {
      try {
        const data = await api(`/bookings/poll/latest?lastId=${latestIdRef.current}`);
        if (data) {
          setNewCount(data.newCount);
          
          if (data.hasNew && initialLoadDone.current) {
            toast.success("🚨 New Booking Received!", {
                description: "A new order has arrived. Please check the Bookings list.",
                duration: 5000,
            });
            // Optional: Try playing a sound
            try {
                const audio = new Audio('/ping.mp3');
                audio.play().catch(e => console.log('Audio playback blocked'));
            } catch(e) {}
          }

          if (data.latestId > latestIdRef.current) {
            latestIdRef.current = data.latestId;
          }
          initialLoadDone.current = true;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollBookings(); // Initial check
    const interval = setInterval(pollBookings, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 transition-all z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      
      {/* Left Axis: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-blue-600 transition-colors" />
        <Separator orientation="vertical" className="mx-1 h-5 bg-slate-200" />
        <div className="flex items-center gap-2 text-sm font-bold capitalize tracking-wide text-slate-900">
           <span className="text-slate-400 font-medium">Workspace <span className="mx-1">/</span></span>
           <span className="text-blue-700">{currentPage.replace(/-/g, ' ')}</span>
        </div>
      </div>

      {/* Right Axis: Utils */}
      <div className="flex items-center gap-3 lg:gap-5">
         
         {/* Search Box */}
         <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search bookings, drivers..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-700 placeholder-slate-400 w-48 lg:w-72 shadow-inner shadow-slate-100"
            />
         </div>

         {/* Notification Bell */}
         <button 
            onClick={() => router.push('/dashboard/bookings?status=new_booking')}
            className="relative p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 border border-slate-100 hover:bg-blue-50 rounded-full transition-all shadow-sm"
         >
            <Bell className="w-4 h-4" />
            {newCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    {newCount > 9 ? '9+' : newCount}
                </span>
            )}
         </button>

         {/* Settings */}
         <button className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 border border-slate-100 hover:bg-blue-50 rounded-full transition-all shadow-sm">
            <Settings className="w-4 h-4" />
         </button>
      </div>

    </header>
  );
}
