import { create } from "zustand";
import { type CanvasStore, type NodeType } from "./type";
import { INIT_POSITION } from "../canvas/constants/data";
import type { Vector3 } from "three";

const initState = {
  addInstances: {} as Record<string, NodeType[]>,
  center: INIT_POSITION.clone(),
};

const useCanvasStore = create<CanvasStore>((set) => ({
  ...initState,

  setAddInstances: (addInstances: Record<string, NodeType[]>) =>
    set({ addInstances }),
  setCenter: (center: Vector3) => set({ center }),
}));

export default useCanvasStore;
