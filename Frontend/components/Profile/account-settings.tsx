"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import EnableTwoFactor from "../auth/enable-two-factor";
import { UserDashboardData } from "@/actions/user-actions";
import { authClient } from "@/lib/auth-client";
import { updatePasswordFormSchema } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { format, set } from "date-fns";

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const deleteFormSchema = z.object({
  confirm: z.string().refine((val: string | null) => val === "delete", {
    message: 'Please type "delete" to confirm.',
  }),
});

interface Session {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined | undefined;
  userAgent?: string | null | undefined | undefined;
}

export function AccountSettings({ session }: { session: UserDashboardData }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastLogins, setLastLogins] = useState<Session[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState<
    boolean | undefined
  >(false);
  const isEmailVerified = session?.emailVerified;

  async function getLastLogin() {
    try {
      const sessions = await authClient.listSessions();
      if (sessions.data && sessions.data.length > 0) {
        const lastFewLogins = sessions.data.slice(0, 5); // For example, we take the last 5 logins
        setLastLogins(lastFewLogins);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }

  useEffect(() => {
    getLastLogin();
  }, []);

  async function revokeSession(token: string) {
    await authClient.revokeSession({
      token: token,
    });
  }

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: session?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof updatePasswordFormSchema>>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteForm = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: {
      confirm: "delete",
    },
  });

  async function onEmailSubmit(data: z.infer<typeof emailFormSchema>) {
    setIsSubmitting(true);
    try {
      await authClient.changeEmail({
        newEmail: data.email,
        callbackURL: "/dashboard/profile", //to redirect after verification
      });
      isEmailVerified
        ? toast.info(
            "A verification link has been sent to your new email address."
          )
        : toast.info("Your email address has been successfully updated.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      emailForm.reset();
    }
  }

  async function onPasswordSubmit(
    data: z.infer<typeof updatePasswordFormSchema>
  ) {
    setIsSubmitting(true);
    try {
      await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true, // revoke all other sessions the user is signed into
      });
      toast("Your password has been successfully updated.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      passwordForm.reset();
    }
  }

  async function onDeleteAccount(data: z.infer<typeof deleteFormSchema>) {
    setIsSubmitting(true);
    try {
      await authClient.deleteUser({
        callbackURL: "/goodbye",
      });
      toast("Please check your email to confirm account deletion.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
      deleteForm.reset();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Update your email address associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isEmailVerified
                            ? "Enter your email address"
                            : "Enter new email"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEmailVerified
                        ? "We'll send a verification link to this email."
                        : "Update your email address."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">
                  {isSubmitting ? "Updating..." : "Update Email"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Ensure your account is using a secure password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Current password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="New password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Additional security options for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EnableTwoFactor session={session} />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">
                Login Activity Notifications
              </h4>
              <p className="text-sm text-muted-foreground">
                Get notified about new login attempts.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="border-t pt-6 space-y-4">
            {lastLogins.map((login, index) => (
              <div
                key={login.id}
                className="flex items-start space-x-4 p-4 shadow-sm rounded-lg border border-gray-200"
              >
                {/* Icon and alert title */}
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <AlertTitle className="text-lg font-semibold text-gray-800">
                    Login Information #{index + 1}
                  </AlertTitle>
                  <AlertDescription className="text-sm text-gray-600">
                    <p>
                      Last login:{" "}
                      <span className="font-medium text-gray-900">
                        {login.ipAddress}
                      </span>
                    </p>
                    <p>
                      From{" "}
                      <span className="font-medium">
                        {login.userAgent}
                      </span>{" "}
                      on{" "}
                      <span className="font-medium">
                        {format(login.createdAt, "dd MMMM yyyy hh:mm a")}
                      </span>
                    </p>
                  </AlertDescription>
                </div>
                <div className="flex-shrink-0 self-start">
                  <Button
                    variant="outline"
                    onClick={() => revokeSession(login.token)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions related to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-destructive/50 p-4">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <h4 className="text-sm font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowConfirmDialog(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex gap-2">
              <AlertCircle size={16} /> Action cannot be undone!
            </DialogTitle>
          </DialogHeader>
          <Form {...deleteForm}>
            <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)}>
              <FormField
                control={deleteForm.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="delete"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogDescription>
            Type <span className="bg-zinc-300 p-1 rounded-sm">delete</span> to
            confirm deleting your account
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog((prev) => !prev)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteForm.handleSubmit(onDeleteAccount)}
            >
              {isSubmitting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
