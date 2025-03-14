"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  text?: string;
  userName: string;
  userImage?: string;
  lastLogin: string;
}

export function DashboardHeader({
  heading,
  text,
  userName,
  userImage,
  lastLogin,
  className,
  ...props
}: DashboardHeaderProps) {
  const initials = userName.split(' ').map(n => n[0]).join('');
  
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7091e6] text-[10px] text-white">3</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">Profile Updated</p>
                    <Badge variant="secondary" className="text-[10px]">New</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Your profile information has been updated successfully.</p>
                  <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                </div>
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">Password Changed</p>
                    <Badge variant="secondary" className="text-[10px]">New</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Your account password was changed successfully.</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
                <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">New Login</p>
                    <Badge variant="secondary" className="text-[10px]">New</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">New login detected from New Delhi, India.</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-center cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={userImage} alt={userName} className="h-full w-full object-cover" />
                  <AvatarFallback className="bg-[#7091e6]/10 text-[#7091e6]">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-muted-foreground text-xs">
                Last login: {lastLogin}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}