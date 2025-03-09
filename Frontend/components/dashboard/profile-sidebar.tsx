"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  BrainCircuit,
  Shield,
  CreditCard,
  Key,
  Bell,
  Palette,
  ScrollText,
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

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Security",
    href: "/dashboard/security",
    icon: Shield,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    href: "/dashboard/appearance",
    icon: Palette,
  },
  {
    title: "Logs",
    href: "/dashboard/logs",
    icon: ScrollText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = authClient.useSession()
  
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#7874F2] to-[#6460c8]">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">
              Brain Wave
            </span>
          </Link>
        </SidebarHeader>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-sm text-gray-500">
            Profile Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg transition-",
                        pathname === item.href
                          ? "bg-[#7091e6]/10 text-[#7874F2] hover:text-[#6460c8] hover:bg-[#DFE2FE] font-semibold"
                          : "text-gray-700 hover:text-[#6460c8] hover:bg-[#DFE2FE]"
                      )}
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
          <div className="bg-[#DFE2FE] rounded-lg p-4 mb-4 border border-[#B1CBFA]">
            <div className="font-medium text-base text-[#7874F2] mb-2">
              Logged in as
            </div>
            <div className="text-gray-800 font-semibold">
              {session?.user?.name}
            </div>
            <div className="mt-2 text-gray-600 text-xs">
              Last login: 2 days ago
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)} // Open the dialog when logout button is clicked
            className="w-full text-white bg-[#8E98F5] hover:bg-[#7874F2] transition-colors duration-200"
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
            <AlertDialogCancel
              onClick={() => setIsDialogOpen(false)}
              className="text-white bg-[#7874F2] hover:bg-[#8E98F5] hover:text-white transition-colors duration-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut} // Call sign out after confirmation
              className="bg-[#8E98F5] hover:bg-[#7874F2] transition-colors duration-200"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
