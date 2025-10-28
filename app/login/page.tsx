"use client";

import { any, z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormFields = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast.error(
          res.error === "CredentialsSignin"
            ? "Invalid email or password"
            : res.error
        );
      } else {
        toast.success("Logged in successfully!");
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(message);
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
          <div className="text-red-500 text-sm">{errors.email?.message}</div>

          <Input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
          />
          <div className="text-red-500 text-sm">{errors.password?.message}</div>

          <Button
            type="submit"
            variant="outline"
            className="bg-green-500 text-white hover:bg-green-600 hover:text-white transition-all"
            disabled={isSubmitting}
          >
            <p className="text-[15px] font-semibold">
              {isSubmitting ? "Logging in..." : "Log In"}
            </p>
          </Button>

          <p className="text-center text-sm text-gray-400">
            Don’t have an account?
            <span onClick={()=>router.push("/register")} className="text-green-400 hover:underline cursor-pointer"  >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
