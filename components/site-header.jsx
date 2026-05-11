"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Settings, ChevronRight } from "lucide-react";

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
    <header className="sticky top-0 h-20 shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl px-6 lg:px-10 transition-all z-40 flex shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      
      {/* Left Axis: Breadcrumbs & Trigger */}
      <div className="flex items-center gap-6">
        <SidebarTrigger className="-ml-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95" />
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
             <span>Workspace</span>
             <ChevronRight className="w-3 h-3 text-slate-300" />
             <span className="text-blue-600">{currentPage.replace(/-/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Right Axis: Intelligence & System Utils */}
      <div className="flex items-center gap-4">
         
         {/* Command Search */}
         <div className="relative hidden lg:flex items-center group">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Query fleet data..." 
              className="pl-11 pr-6 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-xs outline-none focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 placeholder-slate-400 w-64 xl:w-80 shadow-sm"
            />
         </div>

         {/* Notification Nexus */}
         <button 
            onClick={() => router.push('/dashboard/bookings?status=new_booking')}
            className="relative w-11 h-11 flex items-center justify-center text-slate-400 hover:text-blue-600 bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 rounded-2xl transition-all active:scale-90"
         >
            <Bell className="w-5 h-5" />
            {newCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-xl border-4 border-white flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce">
                    {newCount > 9 ? '9+' : newCount}
                </span>
            )}
         </button>

         {/* System Settings */}
         <button className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:shadow-xl hover:shadow-slate-200/5 rounded-2xl transition-all active:scale-90">
            <Settings className="w-5 h-5" />
         </button>
      </div>

    </header>
  );
}
