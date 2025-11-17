"use client";
import { getOneContcat } from "@/lib/actions/user";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { UserInfromation } from "@/types/user";
import Image from "next/image";
import { Mic, MicOff, PhoneOff, ScreenShare, Settings } from "lucide-react";
import SettingsModal from "@/components/settingsModal";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

export default function CallingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const receiverId = searchParams.get("receiverId");
  const [user, setUser] = useState<UserInfromation | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data } = useSession();
  const currentUserId = data?.user?.id as string;
  const [content, setContent] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(0);
  const [showContent, setShowContent] = useState(false);
  const [showCapacity, setShowCapacity] = useState(false);
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!receiverId) {
      return;
    }

    const getUser = async () => {
      try {
        const result = await getOneContcat(receiverId as string);
        if (result.success && result.data) {
          setUser(result.data as UserInfromation);
        } else {
          toast.error(result.error || "Failed to get user");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get user";
        toast.error(message);
      }
    };

    getUser();
  }, [receiverId]);

  const closeOrNavigate = () => {
    if (window.opener) {
      window.close();
    } else {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    socket.emit("join_user", currentUserId);

    socket.on("call_rejected", (obj) => {
      if (obj.senderId === currentUserId && obj.receiverId === receiverId) {
        closeOrNavigate();
      }
    });

    const handleCallAccepted = (obj: any) => {
      if (
        (obj.senderId === currentUserId && obj.receiverId === receiverId) ||
        (obj.receiverId === currentUserId && obj.senderId === receiverId)
      ) {
        if (contentTimeoutRef.current) {
          clearTimeout(contentTimeoutRef.current);
        }

        setShowContent(true);
        setShowCapacity(false);
        setContent(obj.content);
        setCapacity(obj.capacity);

        contentTimeoutRef.current = setTimeout(() => {
          setShowContent(false);
          setShowCapacity(true);
          contentTimeoutRef.current = null;
        }, 3000);
      }
    };

    socket.on("call_accepted", handleCallAccepted);

    socket.on("call_ended_by_user", (obj) => {
      if (
        (obj.senderId === currentUserId && obj.receiverId === receiverId) ||
        (obj.receiverId === currentUserId && obj.senderId === receiverId)
      ) {
        closeOrNavigate();
      }
    });

    return () => {
      socket.off("call_rejected");
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_ended_by_user");
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
        contentTimeoutRef.current = null;
      }
    };
  }, [currentUserId, receiverId, searchParams, router]);

  const handleMicClick = () => {
    setIsMicMuted(!isMicMuted);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleCallEnd = () => {
    if (!currentUserId || !receiverId) return;

    socket.emit("end_call", {
      currentUserId: currentUserId,
      otherUserId: receiverId,
    });

    closeOrNavigate();
  };

  const callButtons = [
    {
      name: isMicMuted ? "Mic Off" : "Mic",
      icon: isMicMuted ? <MicOff size={28} /> : <Mic size={28} />,
      isRed: isMicMuted,
      onClick: handleMicClick,
    },
    {
      name: "Screen Share",
      icon: <ScreenShare size={28} />,
      isRed: false,
      onClick: () => {},
    },
    {
      name: "Settings",
      icon: <Settings size={28} />,
      isRed: false,
      onClick: handleSettingsClick,
    },
    {
      name: "Phone Off",
      icon: <PhoneOff size={28} />,
      isRed: true,
      onClick: handleCallEnd,
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        className="absolute inset-0 blur-xl"
        style={{
          backgroundImage: user?.image ? `url(${user.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1f2937",
        }}
      />
      {showContent && (
        <div className="absolute top-4 left-4 z-20 animate-slide-in-left">
          <p className="text-white text-xl font-semibold bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
            {content}
          </p>
        </div>
      )}

      {showCapacity && (
        <div className="absolute top-4 left-4 z-20">
          <p className="text-white text-xl font-semibold bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
            You and {capacity - 1} other on the call
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-center items-center w-full h-full">
        <div className="flex-1 flex justify-center items-center">
          <Image
            className="rounded-full border-4 border-gray-700 shadow-2xl"
            src={user?.image || "/images/no_profile.png"}
            alt="user image"
            width={200}
            height={200}
          />
        </div>

        <div className="w-full bg-black/60 backdrop-blur-sm py-6 px-8">
          <div className="flex justify-center items-center gap-4">
            {callButtons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`${
                  btn.isRed
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                } p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
                title={btn.name}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
