export type VectorType = [number, number, number];

export type NodeType = {
  id: string;
  type: string;
  position: VectorType;
  rotation: VectorType;
  scale: VectorType;
  color: string;
};

export type InstanceNodeType = Record<string, NodeType>;

export type CanvasStore = {
  instanceId: string[];
  listInstance: InstanceNodeType;
  // Thêm index theo type: { "cube": ["id_1", "id_3"], "sphere": ["id_2"] }
  instancesByType: Record<string, string[]>;
  instanceAdded: NodeType[];

  addInstances: (nodes: NodeType[]) => void;
  removeInstances: (ids: string[]) => void;
  updateInstances: (updatedNodes: Partial<NodeType>[]) => void;
};
