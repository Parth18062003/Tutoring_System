"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/schema";
import { boolean, z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import SubmitButton from "../ui/submit-button";

const ForgotPassword = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsPending(true);
    const { error } = await authClient.forgetPassword({
      email: data.email,
      redirectTo: "/authentication/reset-password",
    });

    if (error) {
      toast.error("Some error occurred. Please try again later");
    } else {
      toast.success("Password reset link sent to your email address");
    }
    setIsPending(false);
  };
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center text-xl font-bold">
        Forgot your password
      </CardHeader>
      <CardContent>
        {" "}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        {" "}
        <SubmitButton isSubmitting={isPending} text="Sending...">
          Send reset link
        </SubmitButton>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
