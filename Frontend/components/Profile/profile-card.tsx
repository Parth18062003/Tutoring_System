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

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ProfileCard({ className, ...props }: ProfileCardProps) {
  const [uploading, setUploading] = useState(false);
  const { data: session } = authClient.useSession()
  const currentUser = session?.user.name || "User";
  const currentDate = new Date().toLocaleDateString();

  const handleImageUpload = () => {
    setUploading(true);
    // Simulate upload process
    setTimeout(() => setUploading(false), 1500);
  };

  return (
    <div className={cn(className)} {...props}>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-background">
                <AvatarImage src={session?.user?.image || 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2F0fGVufDB8fDB8fHww'} alt={currentUser} />
                <AvatarFallback className="bg-[#7091e6]/10 text-[#7091e6] text-xl">
                  P
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white"
                  onClick={handleImageUpload}
                  disabled={uploading}
                >
                  <Upload className="h-5 w-5" />
                </Button>
              </div>
              {uploading && (
                <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                  <Progress value={65} className="h-1 w-20" />
                </div>
              )}
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
            
            <Button variant="outline" className="mt-4 w-full">
              Edit Profile
            </Button>
            
            <div className="w-full border-t border-border my-6"></div>
            
            <div className="w-full space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">{session?.user?.email}</p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">New Delhi, India</p>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                <p className="text-sm">Joined </p>
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
              Last updated: {currentDate}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}