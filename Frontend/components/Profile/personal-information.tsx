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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { personalInfoSchema } from "@/lib/schema";

// Modified schema to handle date as string
/* const personalInfoSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }).max(100, {
    message: "Full name cannot exceed 100 characters."
  }),
  displayName: z.string().min(3, {
    message: "Display name must be at least 3 characters.",
  }).max(50, {
    message: "Display name cannot exceed 50 characters."
  }),
  bio: z.string().max(255, {
    message: "Bio cannot exceed 255 characters."
  }).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in YYYY-MM-DD format.",
  }).refine((date) => {
    // Check if the date is valid, not in the future, and not too old
    try {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && 
        parsedDate < new Date() && 
        parsedDate > new Date("1900-01-01");
    } catch {
      return false;
    }
  }, {
    message: "Date of birth must be a valid date in the past."
  }),
  location: z.string().max(255, {
    message: "Location cannot exceed 255 characters."
  }).optional(),
  phoneNumber: z.string().max(20, {
    message: "Phone number cannot exceed 20 characters."
  }).optional(),
  school: z.string().max(100, {
    message: "School name cannot exceed 100 characters."
  }).optional(),
  grade: z.string().max(20, {
    message: "Grade cannot exceed 20 characters."
  }).optional(),
});
 */
export function PersonalInformation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      displayName: "",
      bio: "",
      dateOfBirth: "",
      location: "",
      phoneNumber: "",
      school: "",
      grade: "",
      gender: "male",
    },
  });

  // Function to convert Date to YYYY-MM-DD string
  const formatDateToString = (date: Date | null | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  // Function to convert YYYY-MM-DD string to Date
  const parseStringToDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const parsedDate = new Date(dateString);
      return !isNaN(parsedDate.getTime()) ? parsedDate : undefined;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    // Fetch the user's personal information
    const fetchUserData = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/update-user-details");
        const data = await response.json();

        if (data.success && data.user) {
          // Format and set form data
          const dateOfBirth = data.user.dateOfBirth || "2003-06-18";
          
          form.reset({
            fullName: data.user.fullName || data.user.name || "",
            displayName: data.user.displayName || data.user.name || "",
            bio: data.user.bio || "",
            dateOfBirth: dateOfBirth,
            location: data.user.location || "",
            phoneNumber: data.user.phoneNumber || "",
            school: data.user.school || "",
            grade: data.user.grade || "",
          });
          
          // Set the selected date for the calendar
          setSelectedDate(parseStringToDate(dateOfBirth));
        } else {
          console.error("Failed to fetch user data:", data.error);
          // If API call fails, use the default values
          form.reset({
            fullName: "Parth Sharma",
            displayName: "Parth18062003",
            bio: "Computer Science student passionate about AI and machine learning.",
            dateOfBirth: "2003-06-18",
            location: "New Delhi, India",
            phoneNumber: "+91 98765 43210",
            school: "St. Xavier's School",
            grade: "12th",
          });
          
          // Set the default selected date
          setSelectedDate(parseStringToDate("2003-06-18"));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Failed to load profile",
          description: "We couldn't load your profile data. Using default information instead.",
          variant: "destructive",
        });
        
        // If fetch fails, use defaults
        form.reset({
          fullName: "Parth Sharma",
          displayName: "Parth18062003",
          bio: "Computer Science student passionate about AI and machine learning.",
          dateOfBirth: "2003-06-18",
          location: "New Delhi, India",
          phoneNumber: "+91 98765 43210",
          school: "St. Xavier's School",
          grade: "12th",
        });
        
        // Set the default selected date
        setSelectedDate(parseStringToDate("2003-06-18"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [form]);

  async function onSubmit(data: z.infer<typeof personalInfoSchema>) {
    try {
      setIsLoading(true);
      
      // Create a timestamp for logging
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Submitting form data:`, data);
      
      // Send the updated data to the API
      const response = await fetch("/api/update-user-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`[${timestamp}] Form submission failed:`, result);
        
        toast({
          title: "Update failed",
          description: result.error || "Failed to update personal information.",
          variant: "destructive",
        });
        return;
      }

      console.log(`[${timestamp}] Form submission successful:`, result);
      
      toast({
        title: "Personal information updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating personal information:", error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Loading your profile information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and how we can contact you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Username or nickname" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how others will see you on the platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description about yourself. Max 255 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="YYYY-MM-DD" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedDate(parseStringToDate(e.target.value));
                          }}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="icon"
                            type="button"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                const dateStr = formatDateToString(date);
                                field.onChange(dateStr);
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormDescription>
                      Enter date in YYYY-MM-DD format or use the calendar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your phone number is private and not shared.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <FormControl>
                      <Input placeholder="Your school" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input placeholder="12th" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => form.reset()} 
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}