"use client";

import { getOneContcat } from "@/lib/actions/user";
import { Video, Phone, CircleAlert } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { UserWithoutId } from "@/types/user";
import { toast } from "sonner";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type UserInfromationProps = {
  reciver_id: string;
};
const buttons = [
  { desciption: "Video Call", icon: <Video size={22} /> },
  { desciption: "Conversation Information", icon: <CircleAlert size={22} /> },
];

export function UserInfromation({ reciver_id }: UserInfromationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithoutId>();
  const gettingUser = useCallback(async () => {
    try {
      const result = await getOneContcat(reciver_id);
      if (!result.success || !result.data) {
        toast.error(result.error);
        return;
      }
      setUser(result.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong, try again later";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [reciver_id]);

  useEffect(() => {
    gettingUser();
  }, [gettingUser]);

  function version2() {
    toast.info("Will be Added later");
  }

  function audioCallClicked() {
    window.open(`/audio-call?receiverId=${reciver_id}`);
  }

  if (isLoading)
    return (
      <div className="bg-gray-900 h-20">
        <div className="flex justify-between items-center pt-5 pl-5 pr-4 w-full">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-500" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px] bg-gray-500" />
              <Skeleton className="h-4 w-[220px] bg-gray-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full bg-gray-500" />
            <Skeleton className="h-5 w-5 rounded-full bg-gray-500" />
            <Skeleton className="h-5 w-5 rounded-full bg-gray-500" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex justify-between items-center border-b border-gray-400 px-4 py-3 bg-gray-900 shadow-md sticky top-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            alt="user image"
            src={user?.image ? user.image : "/images/no_profile.png"}
            width={55}
            height={55}
            className="rounded-full object-cover border border-gray-700"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-white text-lg font-semibold capitalize tracking-wide">
            {user?.username}
          </p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-5 mr-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={audioCallClicked}
              className="text-gray-400 hover:text-gray-200 text-4xl p-0 cursor-pointer"
            >
              <Phone size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Audio call</p>
          </TooltipContent>
        </Tooltip>

        {buttons.map((btn, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <button
                onClick={version2}
                className="text-gray-400 hover:text-gray-200 text-4xl p-0 cursor-pointer"
              >
                {btn.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{btn.desciption}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
