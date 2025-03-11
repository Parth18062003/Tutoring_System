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
  CardFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Loader2, Pencil } from "lucide-react";
import { format, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { personalInfoSchema } from "@/lib/schema";
import classNames from "react-day-picker/style.module.css";
import { DropdownNavProps, DropdownProps } from "react-day-picker";
import { userData } from "@/lib/actions";

type UserDataType = z.infer<typeof personalInfoSchema>;

export function PersonalInformation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [originalData, setOriginalData] = useState<UserDataType | null>(null);

  const form = useForm<UserDataType>({
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

  // Function to get only the changed fields
  const getChangedFields = (
    original: UserDataType,
    current: UserDataType
  ): Partial<UserDataType> => {
    const changedFields: Partial<UserDataType> = {};
    
    (Object.keys(current) as Array<keyof UserDataType>).forEach((key) => {
      if (original[key] !== current[key]) {
        changedFields[key] = current[key];
      }
    });
    
    return changedFields;
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

          const userData = {
            fullName: data.user.fullName || data.user.name || "",
            displayName: data.user.displayName || data.user.name || "",
            bio: data.user.bio || "",
            dateOfBirth: dateOfBirth,
            location: data.user.location || "",
            phoneNumber: data.user.phoneNumber || "",
            school: data.user.school || "",
            grade: data.user.grade || "",
            gender: data.user.gender || "male",
          };

          // Store original data for comparison later
          setOriginalData(userData);
          form.reset(userData);

          // Set the selected date for the calendar
          setSelectedDate(parseStringToDate(dateOfBirth));
        } else {
          console.error("Failed to fetch user data:", data.error);
          // If API call fails, use the default values
          const defaultData = {
            fullName: "Parth Sharma",
            displayName: "Parth18062003",
            bio: "Computer Science student passionate about AI and machine learning.",
            dateOfBirth: "2003-06-18",
            location: "New Delhi, India",
            phoneNumber: "+91 98765 43210",
            school: "St. Xavier's School",
            grade: "12th",
            gender: "male",
          };

          setOriginalData(defaultData);
          form.reset(defaultData);

          // Set the default selected date
          setSelectedDate(parseStringToDate("2003-06-18"));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Failed to load profile",
          description:
            "We couldn't load your profile data. Using default information instead.",
          variant: "destructive",
        });

        // If fetch fails, use defaults
        const defaultData = {
          fullName: "Parth Sharma",
          displayName: "Parth18062003",
          bio: "Computer Science student passionate about AI and machine learning.",
          dateOfBirth: "2003-06-18",
          location: "New Delhi, India",
          phoneNumber: "+91 98765 43210",
          school: "St. Xavier's School",
          grade: "12th",
          gender: "male",
        };

        setOriginalData(defaultData);
        form.reset(defaultData);

        // Set the default selected date
        setSelectedDate(parseStringToDate("2003-06-18"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [form]);

  async function onSubmit(data: UserDataType) {
    if (!originalData) return;

    try {
      setIsLoading(true);
      
      // Get only the fields that have changed
      const changedFields = getChangedFields(originalData, data);
      
      // If no fields changed, no need to make an API call
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No changes detected",
          description: "No changes were made to your profile.",
        });
        setEditMode(false);
        return;
      }

      // Create a timestamp for logging
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Submitting changed fields:`, changedFields);

      // Send only the updated fields to the API
      const response = await fetch("/api/update-user-details", {
        method: "PATCH", // Using PATCH instead of PUT for partial updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          changes: changedFields,
        }),
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

      // Update the original data with the new values
      setOriginalData(data);
      
      toast({
        title: "Personal information updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Exit edit mode after successful update
      setEditMode(false);
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

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // If we're in edit mode, show confirmation dialog before canceling
      const formValues = form.getValues();
      const hasChanges = originalData && Object.keys(getChangedFields(originalData, formValues)).length > 0;
      
      if (hasChanges) {
        setShowSaveDialog(true);
      } else {
        // No changes, just exit edit mode
        setEditMode(false);
        form.reset(originalData || undefined);
      }
    } else {
      // Enter edit mode
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    form.reset(originalData || undefined);
    setSelectedDate(parseStringToDate(originalData?.dateOfBirth || ""));
  };

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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {editMode 
                ? "Edit your personal details below" 
                : "Your personal details and contact information."}
            </CardDescription>
          </div>
          <Button 
            onClick={handleEditToggle}
            variant={editMode ? "default" : "outline"}
          >
            {editMode ? (
              "Cancel Edit"
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
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
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                          disabled={!editMode} 
                        />
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
                        <Input 
                          placeholder="Username or nickname" 
                          {...field} 
                          disabled={!editMode} 
                        />
                      </FormControl>
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
                        disabled={!editMode}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself. Max 255 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-14">
                      <FormLabel>Date of Birth</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="YYYY-MM-DD"
                            {...field}
                            onChange={(e) => {
                              if (editMode) {
                                field.onChange(e);
                                setSelectedDate(parseStringToDate(e.target.value));
                              }
                            }}
                            disabled={!editMode}
                          />
                        </FormControl>
                        {editMode && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={"outline"} size="icon" type="button">
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
                                  date > new Date() || date < new Date("1990-01-01")
                                }
                                captionLayout="dropdown"
                                hideNavigation
                                classNames={{
                                  month_caption: "mx-0",
                                  ...classNames,
                                }}
                                components={{
                                  DropdownNav: (props: DropdownNavProps) => {
                                    return (
                                      <div className="flex w-full items-center gap-2">
                                        {props.children}
                                      </div>
                                    );
                                  },
                                  Dropdown: (props: DropdownProps) => {
                                    return (
                                      <Select
                                      value={String(props.value)}
                                      onValueChange={(value) => {
                                        if (props.onChange) {
                                          handleCalendarChange(
                                            value,
                                            props.onChange
                                          );
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-8 w-fit font-medium first:grow">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[min(16rem,var(--radix-select-content-available-height))]">
                                        {props.options?.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={String(option.value)}
                                            disabled={option.disabled}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                },
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
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
                  <FormItem className="h-14 mt-6 md:mt-0">
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!editMode}
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

            <div className="grid grid-cols-1 md:grid-cols-2 mt-12 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="h-14">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City, Country" 
                        {...field} 
                        disabled={!editMode} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="h-14">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your phone number" 
                        {...field} 
                        disabled={!editMode} 
                      />
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
                  <FormItem className="mt-6">
                    <FormLabel>School</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your school" 
                        {...field} 
                        disabled={!editMode} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="12th" 
                        {...field}
                        disabled={!editMode} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {editMode && (
              <CardFooter className="px-0 pt-6 flex justify-end space-x-2 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancelEdit}
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
              </CardFooter>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>

    <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Do you want to save them before exiting edit mode?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => {
              handleCancelEdit();
              setShowSaveDialog(false);
            }}
          >
            Discard Changes
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              form.handleSubmit(onSubmit)();
              setShowSaveDialog(false);
            }}
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
}