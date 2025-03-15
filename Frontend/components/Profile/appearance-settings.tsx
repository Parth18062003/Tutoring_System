"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, MinusIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ThemeSelector } from "../ThemeSelector";

const appearanceFormSchema = z.object({
  theme: z.string(),
  color: z.enum(["blue", "purple", "green", "orange", "red"]),
  fontSize: z.number().min(80).max(120),
  reducedMotion: z.boolean(),
  reducedTransparency: z.boolean(),
  highContrast: z.boolean(),
});

export function AppearanceSettings() {
  const { setTheme, resolvedTheme } = useTheme();
  const form = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: resolvedTheme,
      color: "blue",
      fontSize: 100,
      reducedMotion: false,
      reducedTransparency: false,
      highContrast: false,
    },
  });

  function onSubmit(data: z.infer<typeof appearanceFormSchema>) {
    setTheme(data.theme);
    toast.info(`Theme set to ${data.theme}`);
  }
  console.log("Theme", resolvedTheme);

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
                        {
                          id: "system",
                          label: "System",
                          description: "Follow system theme",
                          img: "/ui-system.png",
                        },
                        {
                          id: "light",
                          label: "Light",
                          description: "Light theme",
                          img: "/ui-light.png",
                        },
                        {
                          id: "dark",
                          label: "Dark",
                          description: "Dark theme",
                          img: "/ui-dark.png",
                        },
                      ].map((item) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-col items-center"
                        >
                          <FormLabel className="flex flex-col items-center cursor-pointer ">
                            <FormControl>
                              <RadioGroupItem
                                value={item.id}
                                className="sr-only"
                              />
                            </FormControl>

                            <div className="flex flex-col items-center space-y-2">
                              <Image
                                src={item.img}
                                alt={item.label}
                                width={88}
                                height={70}
                                className={`
                                  relative rounded-md overflow-hidden shadow-md cursor-pointer
                                  transition-shadow duration-300 hover:shadow-lg
                                  ${field.value === item.id ? "border-2 border-indigo-500" : "border border-zinc-200"}
                                `}
                              />
                              <span className="text-muted-foreground/70 mt-2 flex items-center gap-1">
                                {field.value === item.id ? (
                                  <CheckIcon
                                    size={16}
                                    className="text-indigo-500"
                                  />
                                ) : (
                                  <MinusIcon size={16} />
                                )}
                                <span
                                  className={`${
                                    field.value === item.id
                                      ? "text-sm text-indigo-500" // Highlight selected theme
                                      : "text-xs" // Default unselected theme
                                  } font-medium text-center`}
                                >
                                  {item.label}
                                </span>
                              </span>
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

<ThemeSelector />
{/*             <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
            /> */}

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
                      <FormLabel className="text-base">
                        Reduced Motion
                      </FormLabel>
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
                      <FormLabel className="text-base">
                        Reduced Transparency
                      </FormLabel>
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Reset to Default
        </Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
