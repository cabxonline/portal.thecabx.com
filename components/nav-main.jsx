"use client"

import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {

  return (
    <SidebarGroup>

      <SidebarGroupContent className="flex flex-col gap-2">

        <SidebarMenu>

          {items.map((item) => (

            <SidebarMenuItem key={item.title}>

              <SidebarMenuButton asChild tooltip={item.title}>

                <Link href={item.url} className="flex items-center gap-2">

                  {item.icon}

                  <span>{item.title}</span>

                </Link>

              </SidebarMenuButton>

            </SidebarMenuItem>

          ))}

        </SidebarMenu>

      </SidebarGroupContent>

    </SidebarGroup>

  )
}