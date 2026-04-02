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


  const analyticsSection = [
    { title: "Booking Analytics", url: "/dashboard/analytics/bookings", icon: <BarChart3Icon /> },
    { title: "Revenue Reports", url: "/dashboard/analytics/revenue", icon: <BarChart3Icon /> }
  ]


  const adminSection = [
    { title: "Maunal Pricing", url: "/dashboard/pricing", icon: <UsersIcon /> },
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
                  flex items-center gap-3 rounded-md px-3 py-2 transition
                  ${isActive
                    ? "bg-black text-white shadow-sm w-full"
                    : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >

                <span className={isActive ? "text-white" : ""}>
                  {item.icon}
                </span>

                <span className="font-medium">
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
                className="flex items-center gap-2 px-3 py-2"
              >

                <CommandIcon className="size-5" />

                <span className="text-base font-semibold">
                  CabX
                </span>

              </Link>

            </SidebarMenuButton>

          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarHeader>



      {/* CONTENT */}

      <SidebarContent>

        {renderMenu(navMain)}

        <div className="px-3 pt-6 text-xs font-semibold text-muted-foreground">
          Vendors
        </div>

        {renderMenu(vendorsSection)}

        <div className="px-3 pt-6 text-xs font-semibold text-muted-foreground">
          Analytics
        </div>

        {renderMenu(analyticsSection)}

        <div className="px-3 pt-6 text-xs font-semibold text-muted-foreground">
          Administration
        </div>

        {renderMenu(adminSection)}

      </SidebarContent>



      {/* FOOTER */}

      <SidebarFooter>

        <NavUser user={sidebarUser} />

      </SidebarFooter>


    </Sidebar>

  )
}