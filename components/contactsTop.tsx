import { Skeleton } from "./ui/skeleton";
import { User } from "next-auth";
import { PencilLine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

type ContactsTopProps = {
  user?: User;
};

export function ContactsTop({ user }: ContactsTopProps) {
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex gap-1.5">
        <Skeleton className="rounded-full w-full h-[25px] bg-gray-500" />
        <Skeleton className="rounded-lg w-[25px] h-[25px] bg-gray-500" />
      </div>
    );
  }

  function handleProfileClicked() {
    router.push("/profile");
  }

  return (
    <div className="text-white flex flex-col gap-3">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold font-serif">
          {" "}
          {user?.name ?? "No user"}
        </h1>
        <Tooltip>
          <TooltipTrigger
            onClick={handleProfileClicked}
            className="p-2 rounded-md hover:bg-gray-700"
          >
            <PencilLine />
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Profile</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Input
        className="placeholder:text-lg rounded-[70px] h-10 "
        placeholder="search"
      />
    </div>
  );
}
