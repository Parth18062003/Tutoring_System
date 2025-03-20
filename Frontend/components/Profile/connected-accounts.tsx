"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LifeBuoy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface AccountData {
  id: string;
  accountId: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  scopes: string[];
}

interface ConnectedAccount {
  id: string;
  provider: string;
  icon: React.ReactNode;
  displayName: string;
  connected: boolean;
  lastUsed?: string;
  accountId?: string;
}

type Provider =
  | "github"
  | "discord"
  | "google"
  | "spotify"
  | "twitter"
  | "reddit";

export function ConnectedAccounts() {
  const providerIcons: Record<Provider | string, React.ReactNode> = {
    github: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 24 24"
      >
        <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6c0-0.4,0-0.9,0.2-1.3 C7.2,6.1,7.4,6,7.5,6c0,0,0.1,0,0.1,0C8.1,6.1,9.1,6.4,10,7.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3c0.9-0.9,2-1.2,2.5-1.3 c0,0,0.1,0,0.1,0c0.2,0,0.3,0.1,0.4,0.3C17,6.7,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4 c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3C22,6.1,16.9,1.4,10.9,2.1z"></path>
      </svg>
    ),
    discord: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 24 24"
      >
        <path d="M19.98,5.69c-1.68-1.34-4.08-1.71-5.12-1.82h-0.04c-0.16,0-0.31,0.09-0.36,0.24c-0.09,0.23,0.05,0.48,0.28,0.52 c1.17,0.24,2.52,0.66,3.75,1.43c0.25,0.15,0.31,0.49,0.11,0.72c-0.16,0.18-0.43,0.2-0.64,0.08C15.56,5.38,12.58,5.3,12,5.3 S8.44,5.38,6.04,6.86C5.83,6.98,5.56,6.96,5.4,6.78C5.2,6.55,5.26,6.21,5.51,6.06c1.23-0.77,2.58-1.19,3.75-1.43 c0.23-0.04,0.37-0.29,0.28-0.52c-0.05-0.15-0.2-0.24-0.36-0.24H9.14C8.1,3.98,5.7,4.35,4.02,5.69C3.04,6.6,1.09,11.83,1,16.46 c0,0.31,0.08,0.62,0.26,0.87c1.17,1.65,3.71,2.64,5.63,2.78c0.29,0.02,0.57-0.11,0.74-0.35c0.01,0,0.01-0.01,0.02-0.02 c0.35-0.48,0.14-1.16-0.42-1.37c-1.6-0.59-2.42-1.29-2.47-1.34c-0.2-0.18-0.22-0.48-0.05-0.68c0.18-0.2,0.48-0.22,0.68-0.04 c0.03,0.02,2.25,1.91,6.61,1.91s6.58-1.89,6.61-1.91c0.2-0.18,0.5-0.16,0.68,0.04c0.17,0.2,0.15,0.5-0.05,0.68 c-0.05,0.05-0.87,0.75-2.47,1.34c-0.56,0.21-0.77,0.89-0.42,1.37c0.01,0.01,0.01,0.02,0.02,0.02c0.17,0.24,0.45,0.37,0.74,0.35 c1.92-0.14,4.46-1.13,5.63-2.78c0.18-0.25,0.26-0.56,0.26-0.87C22.91,11.83,20.96,6.6,19.98,5.69z M8.89,14.87 c-0.92,0-1.67-0.86-1.67-1.91c0-1.06,0.75-1.92,1.67-1.92c0.93,0,1.67,0.86,1.67,1.92C10.56,14.01,9.82,14.87,8.89,14.87z M15.11,14.87c-0.93,0-1.67-0.86-1.67-1.91c0-1.06,0.74-1.92,1.67-1.92c0.92,0,1.67,0.86,1.67,1.92 C16.78,14.01,16.03,14.87,15.11,14.87z"></path>
      </svg>
    ),
    spotify: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 30 30"
      >
        <path d="M15,3C8.4,3,3,8.4,3,15s5.4,12,12,12s12-5.4,12-12S21.6,3,15,3z M19.731,21c-0.22,0-0.33-0.11-0.55-0.22 c-1.65-0.991-3.74-1.54-5.94-1.54c-1.21,0-2.53,0.22-3.63,0.44c-0.22,0-0.44,0.11-0.55,0.11c-0.44,0-0.77-0.33-0.77-0.77 s0.22-0.77,0.66-0.77c1.43-0.33,2.861-0.55,4.401-0.55c2.53,0,4.84,0.66,6.82,1.76c0.22,0.22,0.44,0.33,0.44,0.77 C20.39,20.78,20.06,21,19.731,21z M20.94,17.921c-0.22,0-0.44-0.11-0.66-0.22c-1.87-1.21-4.511-1.87-7.37-1.87 c-1.43,0-2.751,0.22-3.74,0.44c-0.22,0.11-0.33,0.11-0.55,0.11c-0.55,0-0.881-0.44-0.881-0.881c0-0.55,0.22-0.77,0.77-0.991 c1.32-0.33,2.641-0.66,4.511-0.66c3.08,0,5.94,0.77,8.361,2.2c0.33,0.22,0.55,0.55,0.55,0.881 C21.82,17.48,21.491,17.921,20.94,17.921z M22.37,14.4c-0.22,0-0.33-0.11-0.66-0.22c-2.2-1.21-5.39-1.98-8.47-1.98 c-1.54,0-3.19,0.22-4.621,0.55c-0.22,0-0.33,0.11-0.66,0.11c-0.66,0.111-1.1-0.44-1.1-1.099s0.33-0.991,0.77-1.1 C9.39,10.22,11.26,10,13.24,10c3.41,0,6.93,0.77,9.681,2.2c0.33,0.22,0.66,0.55,0.66,1.1C23.471,13.96,23.03,14.4,22.37,14.4z"></path>
      </svg>
    ),
    google: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 24 24"
      >
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
      </svg>
    ),
    twitter: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 30 30"
      >
        <path d="M 6 4 C 4.895 4 4 4.895 4 6 L 4 24 C 4 25.105 4.895 26 6 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 6 4 z M 8.6484375 9 L 13.259766 9 L 15.951172 12.847656 L 19.28125 9 L 20.732422 9 L 16.603516 13.78125 L 21.654297 21 L 17.042969 21 L 14.056641 16.730469 L 10.369141 21 L 8.8945312 21 L 13.400391 15.794922 L 8.6484375 9 z M 10.878906 10.183594 L 17.632812 19.810547 L 19.421875 19.810547 L 12.666016 10.183594 L 10.878906 10.183594 z"></path>
      </svg>
    ),
    reddit: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 30 30"
      >
        <path d="M 17.662109 2 C 15.565005 2 14 3.7131367 14 5.6621094 L 14 9.0351562 C 11.24971 9.1810926 8.7344872 9.9143634 6.7265625 11.064453 C 5.9527826 10.321405 4.9166871 9.991448 3.9121094 9.9921875 C 2.8229214 9.9929893 1.7094525 10.370413 0.94140625 11.234375 L 0.92382812 11.253906 L 0.90625 11.273438 C 0.16947928 12.194228 -0.12225605 13.427747 0.07421875 14.652344 C 0.25365009 15.770711 0.90137168 16.893419 2.0273438 17.628906 C 2.0199689 17.753058 2 17.874618 2 18 C 2 22.962 7.832 27 15 27 C 22.168 27 28 22.962 28 18 C 28 17.874618 27.980031 17.753058 27.972656 17.628906 C 29.098628 16.893419 29.74635 15.770711 29.925781 14.652344 C 30.122256 13.427747 29.830521 12.194228 29.09375 11.273438 L 29.076172 11.253906 L 29.058594 11.234375 C 28.290448 10.370294 27.177168 9.9929893 26.087891 9.9921875 C 25.08323 9.991448 24.046988 10.321133 23.273438 11.064453 C 21.265513 9.9143634 18.75029 9.1810926 16 9.0351562 L 16 5.6621094 C 16 4.6830821 16.565214 4 17.662109 4 C 18.182797 4 18.817104 4.2609042 19.810547 4.609375 C 20.650361 4.9039572 21.743308 5.2016984 23.140625 5.2910156 C 23.474875 6.2790874 24.402814 7 25.5 7 C 26.875 7 28 5.875 28 4.5 C 28 3.125 26.875 2 25.5 2 C 24.561213 2 23.747538 2.5304211 23.320312 3.3007812 C 22.125831 3.2346294 21.248238 2.9947078 20.472656 2.7226562 C 19.568849 2.4056271 18.738422 2 17.662109 2 z M 3.9121094 11.992188 C 4.3072494 11.991896 4.6826692 12.095595 4.9921875 12.263672 C 3.8881963 13.18517 3.0505713 14.261821 2.5449219 15.4375 C 2.2764358 15.106087 2.114647 14.734002 2.0507812 14.335938 C 1.9430146 13.664243 2.1440212 12.966045 2.4628906 12.552734 C 2.7642172 12.228395 3.3144613 11.992626 3.9121094 11.992188 z M 26.085938 11.992188 C 26.683756 11.992627 27.235874 12.22849 27.537109 12.552734 C 27.855979 12.966045 28.056985 13.664243 27.949219 14.335938 C 27.885353 14.734002 27.723564 15.106087 27.455078 15.4375 C 26.949429 14.261821 26.111804 13.18517 25.007812 12.263672 C 25.316626 12.095792 25.690955 11.991896 26.085938 11.992188 z M 10 14 C 11.105 14 12 14.895 12 16 C 12 17.105 11.105 18 10 18 C 8.895 18 8 17.105 8 16 C 8 14.895 8.895 14 10 14 z M 20 14 C 21.105 14 22 14.895 22 16 C 22 17.105 21.105 18 20 18 C 18.895 18 18 17.105 18 16 C 18 14.895 18.895 14 20 14 z M 20.238281 19.533203 C 19.599281 21.400203 17.556 23 15 23 C 12.444 23 10.400719 21.400969 9.7617188 19.667969 C 10.911719 20.600969 12.828 21.267578 15 21.267578 C 17.172 21.267578 19.088281 20.600203 20.238281 19.533203 z"></path>
      </svg>
    ),
    credential: (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key-round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>),
    default: <LifeBuoy className="h-5 w-5" />,
  };

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleProvidersCount, setVisibleProvidersCount] = useState(6);

  async function fetchConnectedAccounts() {
    try {
      setIsLoading(true);
      const response = await authClient.listAccounts();

      console.log("Connected accounts:", response);
      if (response && response.data) {
        const connectedAccounts = response.data.map((account: AccountData) => {
          const provider = account.provider.toLowerCase() as Provider;
          return {
            id: provider,
            provider: provider,
            displayName: provider.charAt(0).toUpperCase() + provider.slice(1),
            icon: providerIcons[provider] || providerIcons.default,
            connected: true,
            accountId: account.accountId,
            lastUsed: account.updatedAt
              .toISOString()
              .replace("T", " ")
              .substring(0, 19),
          };
        });

        setAccounts(connectedAccounts);
      }
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      toast.error("Failed to load connected accounts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  async function linkAccount(provider: Provider) {
    try {
      await authClient.linkSocial({
        provider: provider,
        callbackURL: "/dashboard/profile",
      });
      toast.info(`Redirecting to ${provider} for authentication...`);
    } catch (error) {
      console.error(`Error linking ${provider} account:`, error);
      toast.error(`There was an error connecting to ${provider}.`);
    } 
  }

  async function unlinkAccount(accountId: string, providerId: string) {
    try {
      await authClient.unlinkAccount({
        providerId: providerId,
    });
      console.log("Unlinking account with ID:", accountId);
      setAccounts(
        accounts.filter((account) => account.accountId !== accountId)
      );

      toast.success("Your account has been successfully disconnected.");
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast.error("There was an error disconnecting your account.");
    }
  }

  // Available providers to connect
  const availableProviders: Provider[] = [
    "github",
    "discord",
    "google",
    "spotify",
    "twitter",
    "reddit",
  ];

  // Filter out already connected providers
  const connectableProviders = availableProviders.filter(
    (provider) => !accounts.some((account) => account.provider === provider)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage your external account connections and authentication methods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Why connect accounts?</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            Connected accounts allow for quicker sign-in and can enhance your
            learning experience with integrated features.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              Loading your connected accounts...
            </div>
          ) : accounts.length > 0 ? (
            <>
              <h3 className="text-sm font-medium mb-2">Connected Accounts</h3>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-primary/10 border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-background">
                      {providerIcons[account.provider]}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        {account.displayName}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {account.lastUsed && <>Last used: {account.lastUsed}</>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlinkAccount(account.accountId || "", account.provider || "")}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-2 text-muted-foreground">
              No accounts connected yet. Connect an account below.
            </div>
          )}

          {connectableProviders.length > 0 && (
            <>
              <h3 className="text-sm font-medium mt-6 mb-2">
                Available Connections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectableProviders
                  .slice(0, visibleProvidersCount)
                  .map((provider) => (
                    <div
                      key={provider}
                      className="flex items-center justify-between p-3 border rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                          <div className="text-muted-foreground">
                            {providerIcons[provider] || providerIcons.default}
                          </div>
                        </div>
                        <h4 className="text-sm">
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </h4>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => linkAccount(provider)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
              </div>

              {connectableProviders.length > visibleProvidersCount && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() =>
                    setVisibleProvidersCount(visibleProvidersCount + 6)
                  }
                >
                  Show More (
                  {connectableProviders.length - visibleProvidersCount} more)
                </Button>
              )}

              {visibleProvidersCount > 6 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() =>
                    setVisibleProvidersCount(visibleProvidersCount - 6)
                  }
                >
                  Show Less ({visibleProvidersCount - 6} less)
                </Button>
              )}
            </>
          )}
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Single Sign-On (SSO)</h3>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">
                  Educational Institution SSO
                </h4>
                <p className="text-sm text-muted-foreground">
                  Connect with your university or school account.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
