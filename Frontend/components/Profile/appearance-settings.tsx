"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const appearanceFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  color: z.enum(["blue", "purple", "green", "orange", "red"]),
  fontSize: z.number().min(80).max(120),
  reducedMotion: z.boolean(),
  reducedTransparency: z.boolean(),
  highContrast: z.boolean(),
});

export function AppearanceSettings() {
  const form = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "light",
      color: "blue",
      fontSize: 100,
      reducedMotion: false,
      reducedTransparency: false,
      highContrast: false,
    },
  });

  function onSubmit(data: z.infer<typeof appearanceFormSchema>) {
    toast({
      title: "Appearance settings updated",
      description: "Your preferences have been saved.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks and feels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      className="grid grid-cols-3 gap-4"
                    >
                      {[
                        { id: "system", label: "System", description: "Follow system theme" },
                        { id: "light", label: "Light", description: "Light theme" },
                        { id: "dark", label: "Dark", description: "Dark theme" },
                      ].map((item) => (
                        <FormItem key={item.id}>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                            <FormControl>
                              <RadioGroupItem value={item.id} className="sr-only" />
                            </FormControl>
                            <div className={`border-2 rounded-md p-4 cursor-pointer flex flex-col items-center hover:bg-muted/60 ${
                              field.value === item.id 
                                ? "border-[#7091e6] bg-[#7091e6]/5" 
                                : "border-muted"
                            }`}>
                              <div className={`h-10 w-10 rounded-full mb-2 ${
                                item.id === "system" 
                                  ? "bg-gradient-to-r from-white to-black" 
                                  : item.id === "light"
                                    ? "bg-white border border-gray-200" 
                                    : "bg-slate-800"
                              }`} />
                              <span className="font-medium text-sm">
                                {item.label}
                              </span>
                              {field.value === item.id && (
                                <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-[#7091e6]" />
                              )}
                            </div>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accent color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="blue">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-[#7091e6] mr-2" />
                          Blue
                        </div>
                      </SelectItem>
                      <SelectItem value="purple">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-purple-500 mr-2" />
                          Purple
                        </div>
                      </SelectItem>
                      <SelectItem value="green">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-green-500 mr-2" />
                          Green
                        </div>
                      </SelectItem>
                      <SelectItem value="orange">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-orange-500 mr-2" />
                          Orange
                        </div>
                      </SelectItem>
                      <SelectItem value="red">
                        <div className="flex items-center">
                          <div className="h-4 w-4 rounded-full bg-red-500 mr-2" />
                          Red
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The primary color used throughout the interface.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Font Size: {value}%</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[value]}
                      min={80}
                      max={120}
                      step={5}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust the size of text throughout the application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Accessibility</h3>
              
              <FormField
                control={form.control}
                name="reducedMotion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Reduced Motion</FormLabel>
                      <FormDescription>
                        Minimize animations and transitions.
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
                name="reducedTransparency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Reduced Transparency</FormLabel>
                      <FormDescription>
                        Minimize blurring and transparency effects.
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
                name="highContrast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">High Contrast</FormLabel>
                      <FormDescription>
                        Increase contrast between elements.
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
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button">
                Reset to Default
              </Button>
              <Button type="submit">Save Preferences</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t text-xs text-muted-foreground">
        Last updated: 2025-03-07 17:02:11
      </CardFooter>
    </Card>
  );
}