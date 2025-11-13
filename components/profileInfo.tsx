"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { updateImageOrUsername, getOneContcat } from "@/lib/actions/user";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const usernameSchema = z.object({
  username: z.string().optional().refine(
    (val) => !val || val.trim().length === 0 || val.trim().length >= 5,
    { message: "Username must be at least 5 characters" }
  ),
});

type ProfileInfoProps = {
  userID: string | undefined;
};

export default function ProfileInfo({ userID }: ProfileInfoProps) {
  const [preview, setPreview] = useState<string>("/images/no_profile.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  const userId = userID;

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getOneContcat(userId);
        
        if (result.success && result.data) {
          if (result.data.image) {
            setPreview(result.data.image);
          }
          
          reset({
            username: result.data.username,
          });
        } else {
          toast.error(result.error || "Failed to load user data");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onSubmit = async (data: { username?: string }) => {
    try {
      if (!userId) {
        toast.error("User ID is missing. Please refresh the page.");
        return;
      }

      if (!selectedFile && !data.username?.trim()) {
        toast.error("Please provide a username or select an image to update");
        return;
      }

      let base64Image = "";

      if (selectedFile) {
        base64Image = await fileToBase64(selectedFile);
      }

      const result = await updateImageOrUsername(
        base64Image,
        data.username?.trim() || "",
        userId
      );

      if (!result.success) {
        toast.error(result.error || "Update failed ❌");
      } else {
        toast.success("Profile updated successfully ✅");
        
        const userData = await getOneContcat(userId);
        if (userData.success && userData.data) {
          if (userData.data.image) {
            setPreview(userData.data.image);
          } else {
            setPreview("/images/no_profile.png");
          }
          
          reset({
            username: userData.data.username,
          });
        }
        
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Update error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later.";
      toast.error(message);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  if (!userId) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-100">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Loading user information...</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-100">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-[100px] h-[100px] rounded-full bg-gray-500" />
            <Skeleton className="w-[120px] h-[40px] bg-gray-500 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[80px] h-4 bg-gray-500 rounded" />
            <Skeleton className="w-full h-10 bg-gray-500 rounded" />
          </div>
          <Skeleton className="w-full h-10 bg-gray-500 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700 text-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-100">Profile</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <Image
            src={preview}
            width={100}
            height={100}
            alt="Profile Image"
            className="rounded-full border border-gray-600 object-cover"
          />

          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Upload Image
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Username</label>

            <Input
              {...register("username")}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Enter new username (optional)..."
            />

            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
