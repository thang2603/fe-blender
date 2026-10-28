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

  setAddInstances: (addInstances: Record<string, NodeType[]>) => void;
};

export type ControlStore = {
  mousePosition: Vector3 | null;
  isTransform: boolean;
  triggerSelect: number;
  setMousePosition: (mousePosition: Vector3 | null) => void;
  setIsTransform: () => void;
  setTriggerSelect: () => void;
};
