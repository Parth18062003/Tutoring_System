"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import SubmitButton from "../ui/submit-button";
import { resetPasswordSchema } from "@/lib/schema";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        "Password reset successfully. Please sign in with your new password."
      );
      router.push("/authentication/sign-in");
    }
    setIsPending(false);
  };

  if (error === "invalid_token") {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-[#7874F2]">
            Invalid Reset Link
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-zinc-500">
          This password reset link is invalid or has expired.
        </CardContent>
        <CardFooter className="text-center">
          <Link
            href="/forgot-password"
            className="text-[#7874F2] hover:underline"
          >
            Request a new password reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-[#7874F2]">
          Reset Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitButton isSubmitting={isPending} text="Resetting password...">
              Reset Password
            </SubmitButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
