"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import SubmitButton from "../ui/submit-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
const otpFormSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be at least 6 digit")
    .max(6, "OTP must be at most 6 digit"),
});
const TwoFactor = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const router = useRouter();

  type OtpForm = z.infer<typeof otpFormSchema>;

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timeLeft]);

  async function onSubmit(values: OtpForm) {
    try {
      setIsPending(true),
        await authClient.twoFactor.verifyOtp(
          { code: values.otp },
          {
            onSuccess() {
              setIsPending(false);
              router.push("/dashboard/profile");
              toast.success("OTP verified successfully");
            },
            onError(ctx) {
              setIsPending(false);
              toast.error(ctx.error.message);
            },
          }
        );
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  }

  const resendOTP = async () => {
    if (canResend) {
      const { error } = await authClient.twoFactor.sendOtp();

      if (error) {
        toast.error(error.message);
      } else {
        setTimeLeft(300); // Set 5 minutes countdown (300 seconds)
        setCanResend(false);
        toast.success("OTP sent successfully");
      }
    } else {
      toast.error("You can resend the OTP after 5 minutes.");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center text-xl font-bold">
        Enter the OTP
      </CardHeader>
      <CardContent>
        {" "}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mx-auto">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Button
          variant="link"
          onClick={() => resendOTP()}
          disabled={!canResend}
        >
          {canResend
            ? "Resend the code"
            : `Resend in ${Math.floor(timeLeft / 60)}:${
                timeLeft % 60 < 10 ? "0" : ""
              }${timeLeft % 60}`}
        </Button>
      </CardContent>
      <CardFooter>
        <SubmitButton isSubmitting={isPending} text="Verifying..." onClick={form.handleSubmit(onSubmit)}>
          Verify
        </SubmitButton>
      </CardFooter>
    </Card>
  );
};

export default TwoFactor;
