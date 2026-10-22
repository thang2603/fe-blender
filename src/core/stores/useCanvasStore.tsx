import { create } from "zustand";
import { type CanvasStore, type NodeType } from "./type";
import { covertMapInstance } from "./hepper";
import { INIT_POSITION } from "../canvas/constants/data";

const initState = {
  addInstances: {} as Record<string, NodeType[]>,
  selected: new Map<string, NodeType>(),
  transformSelected: {},
  center: INIT_POSITION.clone(),
};

const useCanvasStore = create<CanvasStore>((set) => ({
  ...initState,

  setAddInstances: (addInstances: Record<string, NodeType[]>) =>
    set({ addInstances }),
  selectInstance: (instance: NodeType) =>
    set((state) => {
      const newMap = new Map<string, NodeType>(state.selected);
      newMap.set(instance.id, instance);
      const { center, data: transformSelected } = covertMapInstance(newMap);
      return {
        selected: newMap,
        center,
        transformSelected,
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
}));

export default useCanvasStore;
