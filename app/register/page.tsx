"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Registeration } from "@/lib/actions/user";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(5, "Username must be at least 5 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type formFields = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<formFields> = async (data) => {
    try {
      const result = await Registeration(data);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Registered successfully");
        await signIn("credentials", {
          email: data.email,
          password: data.password,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      toast.error(e);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-emerald-700 via-gray-900 to-cyan-800">
      <div className="w-[420px] p-8 flex flex-col gap-6 items-center rounded-2xl bg-gray-950 shadow-2xl border border-gray-800">
        <div className="flex justify-center items-center gap-4">
          <Image
            className="rounded-full border border-gray-700"
            src="/images/logo.jpg"
            alt="Profile picture"
            width={80}
            height={80}
            priority
          />
          <p className="text-4xl font-bold text-white tracking-wide">Kchat</p>
        </div>

        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
          />
          <div className="text-red-500">{errors.email?.message} </div>
          <Input
            {...register("username")}
            type="text"
            placeholder="Username"
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
          />
          <div className="text-red-500">{errors.username?.message} </div>

          <div className="relative">
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 pr-10"
            />
            <div className="text-red-500">{errors.password?.message} </div>
          </div>

          <div className="relative">
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 pr-10"
            />
            <div className="text-red-500">
              {errors.confirmPassword?.message}
            </div>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="bg-green-500 text-white hover:bg-green-600 hover:text-white transition-all"
            disabled={isSubmitting}
          >
            <p className="text-[15px] font-semibold">Register</p>
          </Button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-green-400 hover:underline cursor-pointer"
            >
              Log In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
