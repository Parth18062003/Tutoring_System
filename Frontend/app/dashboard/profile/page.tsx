"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/Profile/profile-card";
import { PersonalInformation } from "@/components/Profile/personal-information";
import { AccountSettings } from "@/components/Profile/account-settings";
import { AppearanceSettings } from "@/components/Profile/appearance-settings";
import { NotificationPreferences } from "@/components/Profile/notification-preference";
import { ConnectedAccounts } from "@/components/Profile/connected-accounts";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="User Profile"
        text="Manage your personal information and preferences."
        userName="Parth18062003"
        userImage="/avatars/parth.png"
        lastLogin="2025-03-07 16:57:26"
      />
      
      <div className="grid gap-6 md:grid-cols-12 ">
        <ProfileCard className="md:col-span-4" />
        
        <div className="md:col-span-8">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <PersonalInformation />
            </TabsContent>
            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationPreferences />
            </TabsContent>
            <TabsContent value="connections">
              <ConnectedAccounts />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}