"use client"

import ProfileInfo from "@/components/profileInfo";
import UpdatePassword from "@/components/updatePassword";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
    const { data } = useSession();
    const router = useRouter();
    const user_id=data?.user?.id as string
    
  return (
    <div className="w-full min-h-screen flex flex-col gap-6 p-6 bg-gray-800">
      <button
        onClick={() => router.push("/dashboard")}
        className="w-fit p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors mb-2"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft size={24} />
      </button>
      <ProfileInfo userID={user_id}/>
      <UpdatePassword  userID={user_id}/>
    </div>
  );
}
