import { create } from "zustand";
import { type ControlStore } from "./type";
import type { Vector3 } from "three";

const initState = {
  mousePosition: null,
  isTransform: false,
};
const useControlStore = create<ControlStore>((set) => ({
  ...initState,

  setMousePosition: (mousePosition: Vector3 | null) =>
    set(() => ({ mousePosition })),
  setIsTransform: () => set((state) => ({ isTransform: !state.isTransform })),
}));

export default useControlStore;
