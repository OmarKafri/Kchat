"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { UserInfromation } from "@/types/user";
import { useEffect, useState } from "react";
import { getOneContcat } from "@/lib/actions/user";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SettingsModal from "./settingsModal";

export default function AudioWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Omit<
    UserInfromation,
    "email" | "id"
  > | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const receive_id = searchParams.get("receiverId");
  useEffect(() => {
    if (!receive_id) {
      setIsLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        const result = await getOneContcat(receive_id as string);
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          toast.error(result.error || "Failed to get user");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get user";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [receive_id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="size-10 text-gray-100" />
      </div>
    );

  return (
    <Card className="relative w-[350px] h-[450px] bg-[#27374D] text-white rounded-xl shadow-lg border border-gray-700">
      <SettingsModal />
      <CardContent className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image
              src={user?.image || "/images/no_profile.png"}
              alt="user image"
              width={120}
              height={120}
              className="rounded-full border-4 border-blue-500 shadow-lg object-cover"
            />
          </div>

          <CardTitle className="text-2xl font-bold text-center">
            {user?.username || "Unknown User"}
          </CardTitle>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-300 text-center text-lg">Ready to call?</p>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg  shadow-md hover:shadow-lg">
          Start Call
        </button>
      </CardContent>
    </Card>
  );
}
