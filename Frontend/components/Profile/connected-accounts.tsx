"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

interface ConnectedAccount {
  id: string;
  provider: string;
  icon: React.ReactNode;
  email?: string;
  username?: string;
  connected: boolean;
  lastUsed?: string;
}

export function ConnectedAccounts() {
  const currentDate = "2025-03-07 17:04:03";

  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>([
    {
      id: "google",
      provider: "Google",
      icon: <Mail className="h-5 w-5" />,
      email: "parth18062003@gmail.com",
      connected: true,
      lastUsed: "2025-03-01 09:45:22",
    },
    {
      id: "github",
      provider: "GitHub",
      icon: <Github className="h-5 w-5" />,
      username: "parth18062003",
      connected: true,
      lastUsed: "2025-02-28 14:23:10",
    },
    {
      id: "linkedin",
      provider: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      connected: false,
    },
    {
      id: "twitter",
      provider: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      connected: false,
    },
  ]);

  const handleToggleConnection = (accountId: string) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.id === accountId) {
        const newStatus = !account.connected;
        
        toast({
          title: newStatus 
            ? `Connected to ${account.provider}` 
            : `Disconnected from ${account.provider}`,
          description: newStatus
            ? `Your account is now linked with ${account.provider}.`
            : `Your ${account.provider} account has been disconnected.`,
        });
        
        return {
          ...account,
          connected: newStatus,
          lastUsed: newStatus ? currentDate : account.lastUsed,
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage your external account connections and authentication methods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="bg-[#F0F4FF] border-[#7091e6]/30">
          <AlertCircle className="h-4 w-4 text-[#7091e6]" />
          <AlertTitle>Why connect accounts?</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            Connected accounts allow for quicker sign-in and can enhance your learning experience with integrated features.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className={`flex items-center justify-between p-4 border rounded-lg ${
                account.connected ? "bg-[#F0F4FF]/50 border-[#7091e6]/20" : "bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                  account.connected ? "bg-[#7091e6]/10" : "bg-muted"
                }`}>
                  <div className={account.connected ? "text-[#7091e6]" : "text-muted-foreground"}>
                    {account.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{account.provider}</h4>
                  {account.connected && (
                    <div className="text-xs text-muted-foreground">
                      {account.email || account.username}
                      {account.lastUsed && (
                        <> • Last used: {account.lastUsed}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant={account.connected ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleConnection(account.id)}
              >
                {account.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Single Sign-On (SSO)</h3>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Educational Institution SSO</h4>
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
        
        <div className="border-t pt-4 text-xs text-center text-muted-foreground">
          Last updated: {currentDate}
        </div>
      </CardContent>
    </Card>
  );
}