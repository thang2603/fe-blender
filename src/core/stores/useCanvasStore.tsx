import { create } from "zustand";
import { type CanvasStore, type NodeType } from "./type";

const initState = {
  addInstances: {} as Record<string, NodeType[]>,
};

const useCanvasStore = create<CanvasStore>((set) => ({
  ...initState,
  setAddInstances: (addInstances: Record<string, NodeType[]>) =>
    set(() => ({
      addInstances,
    })),
}));

export default useCanvasStore;
