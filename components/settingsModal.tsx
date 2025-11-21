import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useMediaStore } from "@/store/mediaStore";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsModal({
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: SettingsModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange
    ? externalOnOpenChange
    : setInternalIsOpen;

  const {
    microphones,
    audioOutputs,
    selectedMicrophoneId,
    selectedAudioOutputId,
    microphoneStream,
    setMicrophones,
    setAudioOutputs,
    setSelectedMicrophoneId,
    setSelectedAudioOutputId,
    setMicrophoneStream,
  } = useMediaStore();

  useEffect(() => {
    const loadDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const audioOutputs = devices.filter(
          (device) => device.kind === "audiooutput"
        );
        setMicrophones(microphones);
        setAudioOutputs(audioOutputs);

        if (microphones.length > 0 && !selectedMicrophoneId) {
          setSelectedMicrophoneId(microphones[0].deviceId);
        }
        if (audioOutputs.length > 0 && !selectedAudioOutputId) {
          setSelectedAudioOutputId(audioOutputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error loading devices:", error);
      }
    };
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAudioOutputId) {
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio) => {
        if ("setSinkId" in audio) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (audio as any)
            .setSinkId(selectedAudioOutputId)
            .catch((err: Error) =>
              console.error("Error setting audio output:", err)
            );
        }
      });
    }
  }, [selectedAudioOutputId]);

  const getMicrophoneDisplayValue = () => {
    if (selectedMicrophoneId) {
      const selected = microphones.find(
        (mic) => mic.deviceId === selectedMicrophoneId
      );
      if (selected) return selected.label || "Unknown Microphone";
    }
    if (microphones.length > 0)
      return microphones[0].label || "Default Microphone";
    return "No microphone available";
  };

  const getAudioOutputDisplayValue = () => {
    if (selectedAudioOutputId) {
      const selected = audioOutputs.find(
        (output) => output.deviceId === selectedAudioOutputId
      );
      if (selected) return selected.label || "Unknown Audio Output";
    }
    if (audioOutputs.length > 0)
      return audioOutputs[0].label || "Default Audio Output";
    return "No audio output available";
  };

  const handleMicrophoneChange = async (deviceId: string) => {
    setSelectedMicrophoneId(deviceId);
    try {
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      setMicrophoneStream(stream);
    } catch (error) {
      console.error("Error changing microphone:", error);
      toast.error("Failed to change microphone");
    }
  };

  const handleAudioOutputChange = (deviceId: string) => {
    setSelectedAudioOutputId(deviceId);
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      if ("setSinkId" in audio) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (audio as any)
          .setSinkId(deviceId)
          .catch((err: Error) =>
            console.error("Error setting audio output:", err)
          );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!externalIsOpen && (
        <DialogTrigger
          onClick={() => setIsOpen(true)}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Settings className="size-6 text-gray-100" />
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md bg-[#27374D] text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            Make changes to your Input and Output devices. Click save when
            youre done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="microphone" className="text-sm font-medium">
              Microphone
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full justify-between h-12 text-left font-normal">
                  <span className="truncate">
                    {getMicrophoneDisplayValue()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                {microphones.length > 0 ? (
                  microphones.map((microphone) => (
                    <DropdownMenuItem
                      key={microphone.deviceId}
                      onClick={() =>
                        handleMicrophoneChange(microphone.deviceId)
                      }
                    >
                      {microphone.label || "Unknown Microphone"}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No microphones available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="audioOutput" className="text-sm font-medium">
              Audio Output
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full justify-between h-12 text-left font-normal">
                  <span className="truncate">
                    {getAudioOutputDisplayValue()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                {audioOutputs.length > 0 ? (
                  audioOutputs.map((audioOutput) => (
                    <DropdownMenuItem
                      key={audioOutput.deviceId}
                      onClick={() =>
                        handleAudioOutputChange(audioOutput.deviceId)
                      }
                    >
                      {audioOutput.label || "Unknown Audio Output"}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No audio outputs available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
