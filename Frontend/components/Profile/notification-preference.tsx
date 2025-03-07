"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const notificationSchema = z.object({
  emailAssessmentResults: z.boolean(),
  emailCourseUpdates: z.boolean(),
  emailSystemAnnouncements: z.boolean(),
  emailMarketingUpdates: z.boolean(),
  
  pushAssessmentResults: z.boolean(),
  pushCourseUpdates: z.boolean(),
  pushSystemAnnouncements: z.boolean(),
  pushReminders: z.boolean(),
  
  emailDigestFrequency: z.enum(["never", "daily", "weekly"]),
});

export function NotificationPreferences() {
  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailAssessmentResults: true,
      emailCourseUpdates: true,
      emailSystemAnnouncements: true,
      emailMarketingUpdates: false,
      
      pushAssessmentResults: true,
      pushCourseUpdates: true,
      pushSystemAnnouncements: false,
      pushReminders: true,
      
      emailDigestFrequency: "weekly",
    },
  });

  function onSubmit(data: z.infer<typeof notificationSchema>) {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about activities and updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email Notifications</TabsTrigger>
                <TabsTrigger value="push">Push Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailAssessmentResults"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Assessment Results</FormLabel>
                          <FormDescription>
                            Receive emails when your assessments are graded.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailCourseUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Course Updates</FormLabel>
                          <FormDescription>
                            Receive emails about new content in your enrolled courses.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailSystemAnnouncements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">System Announcements</FormLabel>
                          <FormDescription>
                            Important updates about the learning platform.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailMarketingUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing Updates</FormLabel>
                          <FormDescription>
                            Promotional content and special offers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="emailDigestFrequency"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email Digest Frequency</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="never" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Never - Don't send digest emails
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="daily" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Daily - Send a summary every day
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="weekly" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Weekly - Send a summary every week
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        How often you want to receive a summary of activities.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="push" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="pushAssessmentResults"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Assessment Results</FormLabel>
                        <FormDescription>
                          Receive push notifications when your assessments are graded.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pushCourseUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Course Updates</FormLabel>
                        <FormDescription>
                          Receive push notifications about new content in your enrolled courses.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pushSystemAnnouncements"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">System Announcements</FormLabel>
                        <FormDescription>
                          Important updates about the learning platform.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pushReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Learning Reminders</FormLabel>
                        <FormDescription>
                          Reminders for scheduled learning sessions and deadlines.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Card className="bg-[#F0F4FF]">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Push notifications require browser permissions. If you're not receiving notifications, please check your browser settings.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button">
                Reset to Default
              </Button>
              <Button type="submit">
                Save Preferences
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}