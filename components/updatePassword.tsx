"use client";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updatePassword } from "@/lib/actions/user";
import { checkPassword } from "@/lib/actions/user";

const schema = z
  .object({
    oldPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type formFields = z.infer<typeof schema>;

type UpdatePasswordProps = {
  userID: string;
};

export default function UpdatePassword({ userID }: UpdatePasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<formFields> = async (data) => {
    try {
      const result1 = await checkPassword(userID, data.oldPassword);
      if (!result1.success) {
        toast.error(result1.error);
      } else {
        const result2 = await updatePassword(userID, data.newPassword);
        if (!result2.success) {
          toast.error(result2.error);
        } else {
          toast.success("Password updated ✅");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      toast.error(message);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-100">Password</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Old Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Current Password</label>
            <Input
              type="password"
              {...register("oldPassword")}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Enter current password..."
            />
            <p className="text-red-500 text-sm">
              {errors.oldPassword?.message}
            </p>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">New Password</label>
            <Input
              type="password"
              {...register("newPassword")}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Enter new password..."
            />
            <p className="text-red-500 text-sm">
              {errors.newPassword?.message}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Confirm Password</label>
            <Input
              type="password"
              {...register("confirmPassword")}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Confirm new password..."
            />
            <p className="text-red-500 text-sm">
              {errors.confirmPassword?.message}
            </p>
          </div>

          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            disabled={isSubmitting}
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
