import { create } from "zustand";
import { type ControlStore, type VectorType } from "./type";

const initState = {
  mousePosition: null,
};
const useControlStore = create<ControlStore>((set) => ({
  ...initState,
  setMousePosition: (mousePosition: VectorType | null) =>
    set(() => ({ mousePosition })),
}));

export default useControlStore;
