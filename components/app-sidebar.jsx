"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel
} from "@/components/ui/sidebar"

import {
  LayoutDashboardIcon,
  CarIcon,
  UsersIcon,
  Users2Icon,
  BarChart3Icon,
  StoreIcon,
  ShieldIcon,
  TerminalIcon,
  CommandIcon,
  ClipboardListIcon,
  HeadphonesIcon
} from "lucide-react"

export function AppSidebar(props) {

  const pathname = usePathname()

  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])



  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Customers", url: "/dashboard/customers", icon: <UsersIcon /> },
    { title: "Drivers", url: "/dashboard/drivers", icon: <Users2Icon /> },
    { title: "Fleet", url: "/dashboard/fleet", icon: <CarIcon /> }
  ]


  const vendorsSection = [
    // { title: "Vendors", url: "/dashboard/vendors", icon: <StoreIcon /> }
  ]

  const bookingSection = [
    { title: "All Bookings", url: "/dashboard/bookings", icon: <ClipboardListIcon /> },
    { title: "New Booking", url: "/dashboard/bookings?status=new_booking", icon: <ClipboardListIcon /> },
    { title: "Confirmed", url: "/dashboard/bookings?status=confirmed", icon: <ClipboardListIcon /> },
    { title: "Dispatched", url: "/dashboard/bookings?status=dispatched", icon: <ClipboardListIcon /> },
    { title: "Completed", url: "/dashboard/bookings?status=completed", icon: <ClipboardListIcon /> },
    { title: "Cancelled", url: "/dashboard/bookings?status=cancelled", icon: <ClipboardListIcon /> }
  ]

  const bookingSection1 = [
    { title: "Package Bookings", url: "/dashboard/package-bookings", icon: <ClipboardListIcon /> },
  ]

  const manualFeaturesSection = [
    // { title: "Manual Pricing", url: "/dashboard/pricing", icon: <StoreIcon /> },
    { title: "Trending Fares (TYT)", url: "/dashboard/tyt", icon: <LayoutDashboardIcon /> },
    { title: "Manual Multipliers", url: "/dashboard/multipliers", icon: <BarChart3Icon /> },
    { title: "Daily Rate Logs", url: "/dashboard/tyt-logs", icon: <ClipboardListIcon /> },
    { title: "Airport Rates", url: "/dashboard/airport-rates", icon: <StoreIcon /> },
    { title: "Coupons & Offers", url: "/dashboard/coupons", icon: <StoreIcon /> }
  ]
  const contentSection = [
    { title: "Package Categories", url: "/dashboard/content/categories", icon: <LayoutDashboardIcon /> },
    { title: "Tour Packages", url: "/dashboard/content/packages", icon: <StoreIcon /> },
    { title: "TYT Enquiries", url: "/dashboard/content/tyt-enquiries", icon: <ClipboardListIcon /> },
    { title: "Blog Management", url: "/dashboard/content/blogs", icon: <ClipboardListIcon /> },
    { title: "Policy Management", url: "/dashboard/content/policies", icon: <ShieldIcon /> }
  ]

  const supportSection = [
    { title: "Support Tickets", url: "/dashboard/support", icon: <HeadphonesIcon /> }
  ]


  const analyticsSection = [
    { title: "Booking Analytics", url: "/dashboard/analytics/bookings", icon: <BarChart3Icon /> },
    { title: "Revenue Reports", url: "/dashboard/analytics/revenue", icon: <BarChart3Icon /> }
  ]


  const adminSection = [
    { title: "Car Categories", url: "/dashboard/carcategory", icon: <UsersIcon /> },
    { title: "User Management", url: "/dashboard/users", icon: <UsersIcon /> },
    { title: "Role Management", url: "/dashboard/roles", icon: <ShieldIcon /> },
    { title: "Permissions", url: "/dashboard/permissions", icon: <ShieldIcon /> },
    { title: "System Logs", url: "/dashboard/logs", icon: <TerminalIcon /> }
  ]


  const sidebarUser = {
    name: user?.name || "Guest",
    email: user?.email || "",
    avatar: "/avatars/default.jpg"
  }


  const renderMenu = (items) => (
    <SidebarMenu>
      {items.map(item => {

        const isActive =
          item.url === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.url)

        return (

          <SidebarMenuItem key={item.url}>

            <SidebarMenuButton asChild>

              <Link
                href={item.url}
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300
                  ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 w-full font-black border border-blue-500"
                    : "hover:bg-white/5 text-slate-400 font-bold hover:text-slate-50"
                  }
                `}
              >

                <span className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300 transition-colors"}>
                  {item.icon}
                </span>

                <span className="tracking-wide">
                  {item.title}
                </span>

              </Link>

            </SidebarMenuButton>

          </SidebarMenuItem>

        )

      })}
    </SidebarMenu>
  )


  return (

    <Sidebar collapsible="offcanvas" {...props}>


      {/* HEADER */}

      <SidebarHeader>

        <SidebarMenu>

          <SidebarMenuItem>

            <SidebarMenuButton asChild>

              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-2 py-3"
              >

                <img
                  src="/logo.png"
                  alt="CabX"
                  className="h-90  w-90 object-contain brightness-0 invert opacity-90"
                  onError={(e) => {
                    // Fallback to text if logo.png is not found in portal public dir
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />

                {/* Fallback box if image breaks */}
                <div className="hidden aspect-square size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                  <span className="font-black text-sm tracking-tighter">CX</span>
                </div>

              </Link>

            </SidebarMenuButton>

          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarHeader>



      {/* CONTENT */}

      <SidebarContent className="px-2 pt-4">

        {renderMenu(navMain)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Booking
        </SidebarGroupLabel>
        {renderMenu(bookingSection)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Package Booking
        </SidebarGroupLabel>
        {renderMenu(bookingSection1)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Manual Features
        </SidebarGroupLabel>
        {renderMenu(manualFeaturesSection)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Content Features
        </SidebarGroupLabel>
        {renderMenu(contentSection)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Support
        </SidebarGroupLabel>
        {renderMenu(supportSection)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          Intelligence
        </SidebarGroupLabel>
        {renderMenu(analyticsSection)}

        <SidebarGroupLabel className="mt-8 mb-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 px-4">
          System Administration
        </SidebarGroupLabel>
        {renderMenu(adminSection)}

      </SidebarContent>



      {/* FOOTER */}

      <SidebarFooter>

        <NavUser user={sidebarUser} />

      </SidebarFooter>


    </Sidebar>

  )
}