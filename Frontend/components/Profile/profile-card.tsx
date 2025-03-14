"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Calendar, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import { Session } from "@/lib/auth";
import { UserDashboardData } from "@/actions/user-actions";
import { format } from "date-fns";
import { UploadAvatar } from "./upload-avatar";

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {session: UserDashboardData}

export function ProfileCard({ className, session, ...props }: ProfileCardProps) {
  const currentUser = session.name || "User";
  return (
    <div className={cn(className)} {...props}>
      <Card >
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <UploadAvatar session={session} />
            </div>
            
            <h2 className="text-xl font-semibold mt-4">{currentUser}</h2>
            <p className="text-muted-foreground text-sm">Advanced Student</p>
            
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="bg-[#7091e6]/10 text-[#7091e6] hover:bg-[#7091e6]/20">
                Mathematics
              </Badge>
              <Badge variant="secondary" className="bg-[#7091e6]/10 text-[#7091e6] hover:bg-[#7091e6]/20">
                Computer Science
              </Badge>
            </div>
            
            <div className="w-full border-t border-border my-6"></div>
            
            <div className="w-full space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">{session?.email}</p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">{session?.address}</p>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">Joined {format(session.createdAt, "MMMM yyyy")} </p>
              </div>
            </div>
            
            <div className="w-full border-t border-border my-6"></div>
            
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Learning Progress</h3>
              <Progress value={73} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>73% Complete</span>
                <span>Level 4</span>
              </div>
            </div>
            
            <div className="w-full border-t border-border my-6"></div>
            
            <div className="w-full text-xs text-center text-muted-foreground">
              Last updated: {session.updatedAt.toLocaleDateString('en-ca')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}