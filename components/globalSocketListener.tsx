"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getOneContcat } from "@/lib/actions/user";
import { UserWithoutId } from "@/types/user";
import Image from "next/image";
import { Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

const callTimeout = 5000; // thjis means 25 seconds

export function GlobalSocketListener() {
  const { data, status } = useSession();
  const currentUserId = data?.user?.id as string;
  const [incomingCall, setIncomingCall] = useState<{
    senderId: string;
    receiverId: string;
  } | null>(null);
  const [callerInfo, setCallerInfo] = useState<UserWithoutId | null>(null);
  const [isLoadingCaller, setIsLoadingCaller] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (!incomingCall?.senderId) {
      setCallerInfo(null);
      return;
    }

    const fetchCallerInfo = async () => {
      setIsLoadingCaller(true);
      try {
        const result = await getOneContcat(incomingCall.senderId);
        if (result.success && result.data) {
          setCallerInfo(result.data);
        }
      } catch (error) {
        toast.error("Error fetching caller info");
        console.error("Error fetching caller info:", error);
      } finally {
        setIsLoadingCaller(false);
      }
    };

    fetchCallerInfo();
  }, [incomingCall?.senderId]);

  useEffect(() => {
    if (status !== "authenticated" || !currentUserId) {
      return;
    }

    socket.emit("join_user", currentUserId);

    socket.on("send_call_request", (obj) => {
      if (obj.receiverId === currentUserId) {
        setIncomingCall({ senderId: obj.senderId, receiverId: obj.receiverId });
      } else toast.error("Call request received from another user");
    });

    return () => {
      socket.off("send_call_request");
    };
  }, [status, currentUserId]);

  useEffect(() => {
    if (!incomingCall) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [incomingCall]);

  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.01;
        audioRef.current
          .play()
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              audioRef.current.volume = 1;
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  useEffect(() => {
    if (!incomingCall) {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      return;
    }

    callTimeoutRef.current = setTimeout(() => {
      socket.emit("reject_call", {
        senderId: incomingCall.senderId,
        receiverId: incomingCall.receiverId,
      });
      setIncomingCall(null);
      socket.emit("call_ended", {
        senderId: incomingCall.senderId,
        receiverId: incomingCall.receiverId,
      });
    }, callTimeout);

    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    setIncomingCall(null);
    socket.emit("accept_call", {
      senderId: incomingCall?.senderId,
      receiverId: incomingCall?.receiverId,
    });
    router.push(
      `/audio-call/calling?receiverId=${incomingCall?.senderId}&oncall=true`
    );
  };

  const handleReject = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    setIncomingCall(null);
    socket.emit("reject_call", {
      senderId: incomingCall?.senderId,
      receiverId: incomingCall?.receiverId,
    });
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src="/audios/ringing.mp3" type="audio/mpeg" />
      </audio>

      <Dialog open={!!incomingCall}>
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Incoming Call
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              {isLoadingCaller
                ? "Loading..."
                : callerInfo
                ? `${callerInfo.username} is calling you`
                : "Someone is calling you"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {isLoadingCaller ? (
              <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse" />
            ) : callerInfo ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Image
                    src={callerInfo.image || "/images/no_profile.png"}
                    alt={callerInfo.username}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-blue-500 object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {callerInfo.username}
                  </p>
                  <p className="text-sm text-gray-400">{callerInfo.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                  <Phone className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-white">
                  Unknown Caller
                </p>
              </div>
            )}

            <div className="flex gap-4 w-full">
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
