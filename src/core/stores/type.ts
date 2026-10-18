import type { Vector3Tuple, Vector4Tuple } from "three";

export type NodeType = {
  id: string;
  type: string;
  position: Vector3Tuple;
  quaternion: Vector4Tuple;
  scale: Vector3Tuple;
  color: string;
  instanceId: number;
};

export type InstanceType = {
  uuid: string;
};

export type TransfromMode = "translate" | "rotate" | "scale" | undefined;
export type CanvasStore = {
  addInstances: Record<string, NodeType[]>;
  selected: Map<string, NodeType>;
  isTransform: TransfromMode;
  setAddInstances: (addInstances: Record<string, NodeType[]>) => void;
  //setlected
  selectInstance: (instances: NodeType) => void;
  toggleInstance: (instance: NodeType) => void;
  deselectInstance: (instance: NodeType) => void;
  // deselectInstances: (instances: NodeType[]) => void;
  // clearSelection: () => void;

  // transform
  setIsTransform: (isTransfrom: TransfromMode) => void;
};

export type ControlStore = {
  mousePosition: Vector3Tuple | null;
  setMousePosition: (mousePosition: Vector3Tuple | null) => void;
};
