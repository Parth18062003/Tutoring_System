"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import ProfileSidebar  from "./profile-sidebar";

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <ProfileSidebar />
      <main className={cn("flex flex-col gap-6", className)} {...props}>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
