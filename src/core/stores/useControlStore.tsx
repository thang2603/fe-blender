import { create } from "zustand";
import { type ControlStore } from "./type";
import type { Vector3 } from "three";

const initState = {
  mousePosition: null,
  isTransform: false,
  triggerSelect: 1,
};
const useControlStore = create<ControlStore>((set) => ({
  ...initState,

  setMousePosition: (mousePosition: Vector3 | null) =>
    set(() => ({ mousePosition })),
  setIsTransform: () => set((state) => ({ isTransform: !state.isTransform })),
  setTriggerSelect: () =>
    set((state) => ({ triggerSelect: state.triggerSelect + 1 })),
}));

export default useControlStore;
