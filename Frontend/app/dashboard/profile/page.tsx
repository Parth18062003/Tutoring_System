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
import { Suspense } from "react";
import { getUserData } from "@/actions/user-actions";

// Loading state component
function ProfileSkeleton() {
  return <div className="animate-pulse">Loading profile data...</div>;
}

export default async function ProfilePage() {
  // Properly await the async function
  const userData = await getUserData();
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="User Profile"
        text="Manage your personal information and preferences."
        userName={userData.name || "User"}
        userImage={userData.image || "/avatars/default.png"}
        lastLogin="2025-03-13 15:33:15" // Using the current date from your message
      />

      <div className="grid gap-6 md:grid-cols-12">
        <ProfileCard className="md:col-span-4" session={userData} />

        <div className="md:col-span-8 mx-auto">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-y-5 mb-14 md:mb-0">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <Suspense fallback={<ProfileSkeleton />}>
                <PersonalInformation session={userData} />
              </Suspense>
            </TabsContent>
            <TabsContent value="account">
              <Suspense fallback={<ProfileSkeleton />}>
                <AccountSettings session={userData} />
              </Suspense>
            </TabsContent>
            <TabsContent value="appearance">
              <Suspense fallback={<ProfileSkeleton />}>
                <AppearanceSettings />
              </Suspense>
            </TabsContent>
            <TabsContent value="notifications">
              <Suspense fallback={<ProfileSkeleton />}>
                <NotificationPreferences />
              </Suspense>
            </TabsContent>
            <TabsContent value="connections">
              <Suspense fallback={<ProfileSkeleton />}>
                <ConnectedAccounts />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}