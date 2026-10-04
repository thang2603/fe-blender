import { create } from "zustand";
import type { CanvasStore, NodeType } from "./type";
import { generateUniqueId } from "../canvas/utils/helper";

const initialState = {
  instanceId: [],
  listInstance: {},
  instancesByType: {}, // Khởi tạo
  instanceAdded: [], // Khởi tạo
};

const useCanvasStore = create<CanvasStore>((set) => ({
  ...initialState,

  addInstances: (nodes: NodeType[]) =>
    set((state) => {
      const newNodes = nodes.map((node) => ({
        ...node,
        id: generateUniqueId(),
      }));

      const newListInstance = { ...state.listInstance };
      const newInstanceId = [...state.instanceId];
      const newInstancesByType = { ...state.instancesByType };

      newNodes.forEach((node) => {
        newListInstance[node.id] = node;
        newInstanceId.push(node.id);

        // Thêm ID vào nhóm type tương ứng
        if (!newInstancesByType[node.type]) {
          newInstancesByType[node.type] = [];
        }
        newInstancesByType[node.type].push(node.id);
      });

      return {
        listInstance: newListInstance,
        instanceId: newInstanceId,
        instancesByType: newInstancesByType,
        instanceAdded: [...newNodes], // Cập nhật instanceAdded với các node mới được thêm
      };
    }),

  removeInstances: (ids: string[]) =>
    set((state) => {
      const newListInstance = { ...state.listInstance };
      const newInstanceId = [...state.instanceId];
      const newInstancesByType = { ...state.instancesByType };

      ids.forEach((id) => {
        const node = newListInstance[id];
        if (node) {
          // Xóa khỏi nhóm type tương ứng
          const typeList = newInstancesByType[node.type];
          if (typeList) {
            newInstancesByType[node.type] = typeList.filter((i) => i !== id);
          }
        }
        delete newListInstance[id];
        newInstanceId.splice(newInstanceId.indexOf(id), 1);
      });

      return {
        listInstance: newListInstance,
        instanceId: newInstanceId,
        instancesByType: newInstancesByType,
      };
    }),

  updateInstances: (updatedNodes: Partial<NodeType>[]) =>
    set((state) => {
      const newListInstance = { ...state.listInstance };
      // (Nếu update có đổi type thì cần xử lý thêm, nhưng thường type ít khi đổi)
      updatedNodes.forEach((updatedNode) => {
        const existingNode = newListInstance[updatedNode.id!];
        if (existingNode) {
          newListInstance[updatedNode.id!] = {
            ...existingNode,
            ...updatedNode,
          };
        }
      });

      return { listInstance: newListInstance };
    }),

  resetInstanceAdded: () =>
    set(() => {
      return {
        instanceAdded: [],
      };
    }),
}));

export default useCanvasStore;
