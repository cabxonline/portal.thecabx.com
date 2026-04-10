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
  ClipboardListIcon
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
    { title: "Bookings", url: "/dashboard/bookings", icon: <ClipboardListIcon /> },
    { title: "Customers", url: "/dashboard/customers", icon: <UsersIcon /> },
    { title: "Drivers", url: "/dashboard/drivers", icon: <Users2Icon /> },
    { title: "Fleet", url: "/dashboard/fleet", icon: <CarIcon /> }
  ]


  const vendorsSection = [
    { title: "Vendors", url: "/dashboard/vendors", icon: <StoreIcon /> }
  ]

  const manualFeaturesSection = [
    { title: "Manual Pricing", url: "/dashboard/pricing", icon: <StoreIcon /> },
    { title: "Trending Fares (TYT)", url: "/dashboard/tyt", icon: <LayoutDashboardIcon /> }
  ]

  const contentSection = [
    { title: "Package Categories", url: "/dashboard/content/categories", icon: <LayoutDashboardIcon /> },
    { title: "Tour Packages", url: "/dashboard/content/packages", icon: <StoreIcon /> }
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
                  flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200
                  ${isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm w-full font-bold border border-blue-100"
                    : "hover:bg-slate-50 text-slate-600 font-medium hover:text-slate-900"
                  }
                `}
              >

                <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                  {item.icon}
                </span>

                <span>
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
                  className="h-10  w-10 object-contain"
                  onError={(e) => {
                    // Fallback to text if logo.png is not found in portal public dir
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />

                {/* Fallback box if image breaks */}
                <div className="hidden aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-inner">
                  <span className="font-bold text-xs">CX</span>
                </div>

              </Link>

            </SidebarMenuButton>

          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarHeader>



      {/* CONTENT */}

      <SidebarContent className="px-2 pt-4">

        {renderMenu(navMain)}

        <SidebarGroupLabel className="mt-6 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">
          Marketplace
        </SidebarGroupLabel>
        {renderMenu(vendorsSection)}

        <SidebarGroupLabel className="mt-6 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">
          Manual Features
        </SidebarGroupLabel>
        {renderMenu(manualFeaturesSection)}

        <SidebarGroupLabel className="mt-6 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">
          Content Features
        </SidebarGroupLabel>
        {renderMenu(contentSection)}

        <SidebarGroupLabel className="mt-6 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">
          Intelligence
        </SidebarGroupLabel>
        {renderMenu(analyticsSection)}

        <SidebarGroupLabel className="mt-6 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">
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