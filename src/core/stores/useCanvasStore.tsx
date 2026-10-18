import { create } from "zustand";
import { type CanvasStore, type NodeType, type TransfromMode } from "./type";

const initState = {
  addInstances: {} as Record<string, NodeType[]>,
  selected: new Map<string, NodeType>(),
  isTransform: undefined,
};

const useCanvasStore = create<CanvasStore>((set) => ({
  ...initState,
  setAddInstances: (addInstances: Record<string, NodeType[]>) =>
    set({ addInstances }),
  selectInstance: (instance: NodeType) =>
    set((state) => {
      const newMap = new Map<string, NodeType>(state.selected);
      newMap.set(instance.id, instance);
      return {
        selected: newMap,
      };
    }),
  toggleInstance: (instance: NodeType) =>
    set((state) => {
      const newMap = new Map<string, NodeType>(state.selected);
      const id = instance.id;
      if (newMap.has(id)) newMap.delete(id);
      else newMap.set(instance.id, instance);
      return {
        selected: newMap,
      };
    }),
  deselectInstance: (instance: NodeType) =>
    set((state) => {
      const id = instance.id;
      const isExist = state.selected.has(id);
      if (!isExist) return { selected: state.selected };
      const newMap = new Map<string, NodeType>(state.selected);
      newMap.delete(id);
      return {
        selected: newMap,
      };
    }),
  setIsTransform: (isTransform: TransfromMode) => set({ isTransform }),
}));

export default useCanvasStore;
