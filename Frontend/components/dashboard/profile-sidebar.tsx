"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChartColumnIncreasing,
  User,
  Settings,
  LogOut,
  BrainCircuit,
  Palette,
  ScrollText,
  BookMarked,
  History,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { title } from "process";

const navItems = [
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Start Learning",
    href: "/learning",
    icon: BookOpen
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Saved Content",
    href: "/dashboard/library",
    icon: BookMarked,
  },
  {
    title: "Assessment History",
    href: "/learning/assessment/history",
    icon: History,
  },
  {
    title: "Chatbot",
    href: "/chatbot",
    icon: MessageSquare,
  },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/authentication/sign-in");
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <Sidebar className="w-64 border-r">
      <SidebarContent className="pt-6">
        <SidebarHeader className="px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-foreground">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-primary">
              Brain Wave
            </span>
          </Link>
        </SidebarHeader>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-sm text-primary">
            Profile Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn("flex items-center px-3 py-2.5 rounded-lg")}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="p-4">
          <div className="bg-primary/20 rounded-lg p-4 mb-4 border border-primary-foreground">
            <div className="font-medium text-base text-primary mb-2">
              Logged in as
            </div>
            <div className="text-primary font-bold text-lg">
              {session?.user?.name}
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)} // Open the dialog when logout button is clicked
            className="w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>

      {/* AlertDialog for confirmation */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will be logged out and
              redirected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut} // Call sign out after confirmation
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
