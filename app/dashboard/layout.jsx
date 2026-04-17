import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }) {

  return (

    <SidebarProvider
      style={{
        "--sidebar-width": "240px",
        "--header-height": "64px"
      }}
    >

      <AppSidebar variant="inset" />

      <SidebarInset className="overflow-hidden">
        <SiteHeader />
        <main className="flex flex-1 flex-col p-4 lg:p-6 min-w-0">
          {children}
        </main>
      </SidebarInset>

    </SidebarProvider>

  )

}