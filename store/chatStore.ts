import { create } from "zustand";

type chatState={
    message:string,
    setMessage:(msg:string)=> void
}

export const useChatStore = create<chatState>((set) => ({
  message: "",
  setMessage: (msg: string) => set({ message: msg }),
}));
