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

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");

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

        if (microphones.length > 0) {
          setSelectedMicrophone(
            (prev) => prev || microphones[0].label || "Default Microphone"
          );
        }
        if (audioOutputs.length > 0) {
          setSelectedAudioOutput(
            (prev) => prev || audioOutputs[0].label || "Default Audio Output"
          );
        }
      } catch (error) {
        console.error("Error loading devices:", error);
      }
    };
    loadDevices();
  }, []);

  const getMicrophoneDisplayValue = () => {
    if (selectedMicrophone) return selectedMicrophone;
    if (microphones.length > 0)
      return microphones[0].label || "Default Microphone";
    return "No microphone available";
  };

  const getAudioOutputDisplayValue = () => {
    if (selectedAudioOutput) return selectedAudioOutput;
    if (audioOutputs.length > 0)
      return audioOutputs[0].label || "Default Audio Output";
    return "No audio output available";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <Settings className="size-6 text-gray-100" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#27374D] text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            Make changes to your Input and Output devices. Click save when
            you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="microphone" className="text-sm font-medium">
              Microphone
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="w-full justify-between h-12 text-left font-normal"
                >
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
                      onClick={() => setSelectedMicrophone(microphone.label)}
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
                <Button
                  className="w-full justify-between h-12 text-left font-normal"
                >
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
                      onClick={() => setSelectedAudioOutput(audioOutput.label)}
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
