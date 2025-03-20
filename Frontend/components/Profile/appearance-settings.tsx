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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, MinusIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ThemeSelector } from "../ThemeSelector";
import { useThemeConfig } from "../../hooks/use-active-theme";
import { useFontSizeConfig } from "@/hooks/use-font-size";

const appearanceFormSchema = z.object({
  theme: z.string(),
  color: z.string(),
  fontSize: z.number().min(80).max(120),
  reducedMotion: z.boolean(),
  reducedTransparency: z.boolean(),
  highContrast: z.boolean(),
});

export function AppearanceSettings() {
  const { setTheme, resolvedTheme } = useTheme();
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const { fontSize, setFontSize } = useFontSizeConfig();
  const form = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: resolvedTheme,
      color: activeTheme,
      fontSize: fontSize,
      reducedMotion: false,
      reducedTransparency: false,
      highContrast: false,
    },
  });

  function onSubmit(data: z.infer<typeof appearanceFormSchema>) {
    const { theme, fontSize } = data;
  
    if (theme) {
      setTheme(theme);
      toast.info(`Theme set to ${theme}`);
      console.log("Theme", theme); // assuming `resolvedTheme` holds the actual theme value
    }
  
    if (fontSize) {
      setFontSize(fontSize);
      toast.info(`Font size set to ${fontSize}%`);
      console.log("Font Size", fontSize);
    }
  }

  const handleReset = () => {
    form.reset(
      {
        theme: resolvedTheme,
        color: "blue",
        fontSize: 100,
      }
    );
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
                                  ${field.value === item.id ? "border-2 border-ring shadow-ring" : "border border-primary-foreground"}
                                `}
                              />
                              <span className="text-muted-foreground/70 mt-2 flex items-center gap-1">
                                {field.value === item.id ? (
                                  <CheckIcon
                                    size={16}
                                    className="text-primary"
                                  />
                                ) : (
                                  <MinusIcon size={16} />
                                )}
                                <span
                                  className={`${
                                    field.value === item.id
                                      ? "text-sm text-primary" // Highlight selected theme
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
        <Button variant="outline" type="button" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}
