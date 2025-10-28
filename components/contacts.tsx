"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { UserInfromation } from "@/types/user";
import { getContacts } from "@/lib/actions/user";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import { addConverstaion } from "@/lib/actions/converstaion";
import { useRouter } from "next/navigation";
import { unreadMessages } from "@/lib/actions/messages";
import { socket } from "@/lib/socket";
import { ContactsTop } from "./contactsTop";

export function Contacts() {
  const router = useRouter();

  const [contacts, setContacts] = useState<UserInfromation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>("");
  const [unreadSenders, setUnreadSenders] = useState<string[]>([]);
  const { data, status } = useSession();

  const getUsers = useCallback(async () => {
    if (!data?.user?.id) return;
    try {
      const result = await getContacts(data.user.id);
      if (result.success && result.data) {
        setContacts(result.data);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [data?.user?.id]);

  const getUnreadMessages = useCallback(async () => {
    if (!data?.user?.id) return;
    try {
      const result = await unreadMessages(data.user.id);
      if (result.success && result.data) {
        setUnreadSenders(result.data);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      setError(message);
      toast.error(message);
    }
  }, [data?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") {
      getUsers();
      getUnreadMessages();

      socket.on("read_message", (unread_message) => {
        if (unread_message.isRead === false) {
          setUnreadSenders((prev) =>
            prev.includes(unread_message.senderId)
              ? prev
              : [...prev, unread_message.senderId]
          );
        }
      });
      socket.on("messages_read", (receiverId) => {
        setUnreadSenders((prev) => prev.filter((id) => id !== receiverId));
      });

      return () => {
        socket.off("read_message");
        socket.off("messages_read");
      };
    }
  }, [status, getUsers, getUnreadMessages]);

  async function handleConverstaion(id: string) {
    const senderId = data?.user?.id;
    const receiverId = id;
    try {
      const result = await addConverstaion(senderId as string, receiverId);
      if (!result.success && !result.data) {
        setError(result.error);
        toast.error(result.error);
      } else {
        router.push(`/dashboard/${result.data?.id}?receiverId=${receiverId}`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      setError(message);
      toast.error(message);
    }
  }

  if (error) {
    return (
      <div className="text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-800">
      <div
        className="contacts-container h-screen w-75 flex flex-col gap-4 p-4
         bg-gray-900"
      >
        <ContactsTop user={data?.user} />
        <h1 className="ml-1.5 mt-2 text-xl font-semibold text-gray-200">
          Messages
        </h1>

        {isLoading
          ? Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl"
              >
                <Skeleton className="rounded-full w-[50px] h-[40px] bg-gray-500" />
                <div className="flex flex-col gap-1 w-full">
                  <Skeleton className="w-[120px] h-4 bg-gray-500 rounded" />
                  <Skeleton className="w-[180px] h-3 bg-gray-500 rounded" />
                </div>
              </div>
            ))
          : contacts.map((x) => {
              const hasUnread = unreadSenders?.includes(String(x.id));

              return (
                <div
                  onClick={() => handleConverstaion(String(x.id))}
                  key={x.id}
                  className="relative flex items-center gap-3 p-3 rounded-xl shadow-green-400 hover:shadow-lg transition-shadow duration-800 cursor-pointer"
                >
                  <div className="relative">
                    <Image
                      className="rounded-full"
                      src={x.image ?? "/images/no_profile.png"}
                      alt="Profile picture"
                      width={50}
                      height={50}
                      priority
                    />
                    {hasUnread && (
                      <span className="absolute top-[20px] left-[225px] w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>

                  <div className="flex flex-col w-[200px]">
                    <h1 className="text-gray-200 font-medium">{x.username}</h1>
                    <p className="text-gray-500 text-sm">{x.email}</p>
                  </div>
                </div>
              );
            })}

        <button
          className="text-red-500 mt-4"
          onClick={() => {
            signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
