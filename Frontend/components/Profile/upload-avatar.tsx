"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserDashboardData, updateUserData } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, XIcon, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";
import sha1 from "sha1";
import { Input } from "../ui/input";
import Image from "next/image";

interface UploadAvatarProps {
  session: UserDashboardData;
}

export function UploadAvatar({ session }: UploadAvatarProps) {
  // State variables
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // User data preparation
  const userName = session?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((name) => name?.[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const currentAvatar = session?.image || null;

  // Cloudinary config
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
  const uploadPreset = "brainwave"; // Your upload preset

  // Extract public ID from Cloudinary URL
  const getPublicIdFromUrl = (url: string): string | null => {
    if (!url) return null;

    // Handle different Cloudinary URL formats
    const regex = /\/upload\/v\d+\/(.*)\.\w{3,4}$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Delete image from Cloudinary
  const deleteImageFromCloudinary = async (publicId: string) => {
    if (!publicId || !cloudName || !apiKey || !apiSecret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = sha1(
      `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    );
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    try {
      await axios.post(url, {
        public_id: publicId,
        signature: signature,
        api_key: apiKey,
        timestamp: timestamp,
      });
      console.log("Previous avatar deleted successfully");
    } catch (error) {
      console.error("Failed to delete previous avatar:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("Image size is too large. Please select image with size less than 2MB.")
      }

      // Validate file type
      if (
        !["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          file.type
        )
      ) {
        toast.warning("Invalid file type. Please select a valid image file.");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSelectedFile(file);
        setIsPreviewDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "brainwave");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Image upload failed");
    }
  };

  // Handle confirmation dialog
  const handleConfirmUpload = () => {
    setIsPreviewDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setIsPreviewDialogOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  // Handle avatar click to open file input
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle apply changes
  const handleApplyChanges = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsConfirmDialogOpen(false);

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(selectedFile);
      setUploadedImageUrl(imageUrl);

      // Update user data with new image URL
      const result = await updateUserData({
        image: imageUrl,
        updatedAt: new Date(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile image");
      }

      // Delete previous avatar if it exists
      if (currentAvatar) {
        const publicId = getPublicIdFromUrl(currentAvatar);
        if (publicId) {
          await deleteImageFromCloudinary(publicId);
        }
      }

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update your profile picture. Please try again."
       );
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background cursor-pointer transition-opacity group-hover:opacity-80">
          {currentAvatar ? (
            <AvatarImage
              src={currentAvatar}
              alt={userName}
              loading="eager"
              className="h-full w-full object-cover"
            />
          ) : null}
          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            aria-label="Upload avatar"
            onClick={handleAvatarClick}
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
        {/* Hidden file input */}
        <Input
          type="file"
          ref={fileInputRef}
          id="avatarUpload"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={isPreviewDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsPreviewDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Profile Picture</DialogTitle>
            <DialogDescription>
              Preview how your new profile picture will look.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-4">
            {previewUrl && (
              <div className="relative rounded-full overflow-hidden h-40 w-40 border-2 border-muted">
                <Image
                  height={128}
                  width={128}
                  src={previewUrl}
                  alt="Profile picture preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancelUpload}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpload}
              className="gap-2"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsConfirmDialogOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update profile picture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current profile picture. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center my-4">
            {previewUrl && (
              <div className="relative rounded-full overflow-hidden h-24 w-24 border-2 border-muted">
                <Image
                  height={128}
                  width={128}
                  src={previewUrl}
                  alt="New Profile Picture"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApplyChanges}
              className={cn(
                "gap-2",
                isUploading ? "opacity-70 pointer-events-none" : ""
              )}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Update
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
