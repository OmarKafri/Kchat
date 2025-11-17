import { create } from "zustand";

type mediaState = {
  microphoneStream: MediaStream | null;
  outputStream: MediaStream | null;
  selectedMicrophoneId: string | null;
  selectedAudioOutputId: string | null;
  microphones: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  setMicrophoneStream: (stream: MediaStream | null) => void;
  setOutputStream: (stream: MediaStream | null) => void;
  setSelectedMicrophoneId: (deviceId: string | null) => void;
  setSelectedAudioOutputId: (deviceId: string | null) => void;
  setMicrophones: (devices: MediaDeviceInfo[]) => void;
  setAudioOutputs: (devices: MediaDeviceInfo[]) => void;
};

export const useMediaStore = create<mediaState>((set) => ({
  microphoneStream: null,
  outputStream: null,
  selectedMicrophoneId: null,
  selectedAudioOutputId: null,
  microphones: [],
  audioOutputs: [],
  setMicrophoneStream: (stream: MediaStream | null) =>
    set({ microphoneStream: stream }),
  setOutputStream: (stream: MediaStream | null) =>
    set({ outputStream: stream }),
  setSelectedMicrophoneId: (deviceId: string | null) =>
    set({ selectedMicrophoneId: deviceId }),
  setSelectedAudioOutputId: (deviceId: string | null) =>
    set({ selectedAudioOutputId: deviceId }),
  setMicrophones: (devices: MediaDeviceInfo[]) => set({ microphones: devices }),
  setAudioOutputs: (devices: MediaDeviceInfo[]) =>
    set({ audioOutputs: devices }),
}));