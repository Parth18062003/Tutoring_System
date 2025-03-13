import React, { useState } from "react";
import { Switch } from "../ui/switch";
import { z } from "zod";
import { Session } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { twoFaFormSchema } from "@/lib/schema";
import { UserDashboardData } from "@/actions/user-actions";

type TwoFaFormType = z.infer<typeof twoFaFormSchema>;

const EnableTwoFactor = ({ session }: { session: UserDashboardData }) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const form = useForm<TwoFaFormType>({
    resolver: zodResolver(twoFaFormSchema),
    defaultValues: {
      isEnabled: session?.twoFactorEnabled || false,
      password: "",
    },
  });

  const handleToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setShowPasswordDialog(true);
  };

  const handleCancel = () => {
    setShowPasswordDialog(false);
    form.setValue("password", "");
    setPendingStatus(null);
  };

  async function onSubmit(values: TwoFaFormType) {
    setIsSubmitting(true);
    try {
      if (pendingStatus) {
        const { data, error } = await authClient.twoFactor.enable({
          password: values.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        setIsSubmitting(false);
        form.setValue("isEnabled", true);
        toast.success("2FA enabled successfully");
      }

      if (pendingStatus === false) {
        const { data, error } = await authClient.twoFactor.disable({
          password: values.password,
        });

        if (error) {
          toast.error(error.message);
          throw new Error(error.message);
        }
        setIsSubmitting(false);
        form.setValue("isEnabled", false);
        toast.success("2FA disabled successfully");
      }
      setIsSubmitting(false);
      setShowPasswordDialog(false);
      form.setValue("password", "");
      setPendingStatus(null);
    } catch (error) {
      console.log("Error in changing 2FA status: ", error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="isEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-y-0.5">
                <div>
                  <FormLabel>Two-Factor Authentication (2FA)</FormLabel>
                  <FormDescription>
                    Add an extra layer of security to your account.
                  </FormDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleToggle}
                  aria-readonly={false}
                />
              </FormItem>
            )}
          />

          <Dialog
            open={showPasswordDialog}
            onOpenChange={setShowPasswordDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {pendingStatus ? "Enable" : "Disable"} Two-Factor
                  Authentication
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p>Please enter your password to confirm this action.</p>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                    {isSubmitting ? "Confirming..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </form>
      </Form>
    </div>
  );
};

export default EnableTwoFactor;
