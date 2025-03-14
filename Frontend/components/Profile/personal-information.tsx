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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { personalInfoSchema } from "@/lib/schema";
import classNames from "react-day-picker/style.module.css";
import { DropdownNavProps, DropdownProps } from "react-day-picker";
import { updateUserData, UserDashboardData } from "@/actions/user-actions";
import { toast } from "sonner";

type UserDataType = z.infer<typeof personalInfoSchema>;

export function PersonalInformation({
  session,
}: {
  session: UserDashboardData;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [originalData, setOriginalData] = useState<UserDataType | null>(null);

  const form = useForm<UserDataType>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      displayName: "",
      bio: "",
      dob: "",
      location: "",
      phone: "",
      school: "",
      grade: "",
      gender: "prefer-not-to-say",
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

  // Initialize form with session data
  useEffect(() => {
    if (session) {
      setIsFetching(true);

      try {
        // Use the data directly from the session
        const dob = session.dob || "";

        const formData: UserDataType = {
          name: session.name || "",
          displayName: "", // You may want to add this to your UserDashboardData
          bio:
            session.bio ||
            "",
          dob: dob,
          location: session.address || "", // Using address field for location
          phone: session.phone || "",
          school: session.school || "",
          grade: session.grade || "",
          gender: session.gender || "",
        };

        setOriginalData(formData);
        form.reset(formData);

        // Set date for calendar
        setSelectedDate(parseStringToDate(dob));
      } catch (error) {
        console.error("Error initializing form with session data:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsFetching(false);
      }
    }
  }, [session, form]);

  async function onSubmit(data: UserDataType) {
    if (!originalData) return;

    try {
      setIsLoading(true);

      // Get only the fields that have changed
      const changedFields = getChangedFields(originalData, data);

      // If no fields changed, no need to make an API call
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes were made to your profile.");
        setEditMode(false);
        return;
      }

      // Create a timestamp for logging
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Submitting changed fields:`, changedFields);

      // Map form fields to UserDashboardData fields
      const updateData: Partial<UserDashboardData> = {
        name: changedFields.name,
        bio: changedFields.bio,
        dob: changedFields.dob,
        gender: changedFields.gender,
        phone: changedFields.phone,
        school: changedFields.school,
        grade: changedFields.grade,
        address: changedFields.location, // Map location to address
      };

      // Use the server action to update user data
      const result = await updateUserData(updateData);

      if (!result.success) {
        console.error(`[${timestamp}] Form submission failed:`, result);
        toast.error(result.error || "An unexpected error occurred.");
        return;
      }

      console.log(`[${timestamp}] Form submission successful:`, result);

      // Update the original data with the new values
      setOriginalData(data);

      toast.success("Your profile has been successfully updated.");

      // Exit edit mode after successful update
      setEditMode(false);
    } catch (error) {
      console.error("Error updating personal information:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
      const hasChanges =
        originalData &&
        Object.keys(getChangedFields(originalData, formValues)).length > 0;

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
    setSelectedDate(parseStringToDate(originalData?.dob || ""));
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
                  name="name"
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
                  name="dob"
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
                                setSelectedDate(
                                  parseStringToDate(e.target.value)
                                );
                              }
                            }}
                            disabled={!editMode}
                          />
                        </FormControl>
                        {editMode && (
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
                                  date > new Date() ||
                                  date < new Date("1990-01-01")
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
                  name="phone"
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
              You have unsaved changes. Do you want to save them before exiting
              edit mode?
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
