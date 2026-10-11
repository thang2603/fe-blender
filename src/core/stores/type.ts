export type VectorType = [number, number, number];

export type NodeType = {
  id: string;
  type: string;
  position: VectorType;
  rotation: VectorType;
  scale: VectorType;
  color: string;
};

export type CanvasStore = {
  addInstances: Record<string, NodeType[]>;
  setAddInstances: (addInstances: Record<string, NodeType[]>) => void;
};

export type ControlStore = {
  mousePosition: VectorType | null;
  setMousePosition: (mousePosition: VectorType | null) => void;
};
