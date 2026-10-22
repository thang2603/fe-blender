import type { Quaternion, Vector3 } from "three";

export type NodeType = {
  id: string;
  type: string;
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
  color: string;
  opacity: number;
  instanceId: number;
};

export type InstanceType = {
  uuid: string;
};

export type TransformMode = "translate" | "rotate" | "scale" | undefined;
export type CanvasStore = {
  addInstances: Record<string, NodeType[]>;
  selected: Map<string, NodeType>;
  transformSelected: Record<string, NodeType[]>;
  center: Vector3;
  setAddInstances: (addInstances: Record<string, NodeType[]>) => void;
  //setlected
  selectInstance: (instances: NodeType) => void;
  toggleInstance: (instance: NodeType) => void;
  deselectInstance: (instance: NodeType) => void;

  // deselectInstances: (instances: NodeType[]) => void;
  // clearSelection: () => void;
};

export type ControlStore = {
  mousePosition: Vector3 | null;
  setMousePosition: (mousePosition: Vector3 | null) => void;
};
