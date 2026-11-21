import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
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
  selected: boolean;
};

export type Mesh2 = InstancedMesh2<InstanceType>;
export type Entity = NonNullable<Mesh2["instances"]>[number];

export type InstanceSnapshot = {
  uuid: string;
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

export type TransformMode = "translate" | "rotate" | "scale" | undefined;

export type CanvasStore = {
  addInstances: Record<string, NodeType[]>;

  setAddInstances: (addInstances: Record<string, NodeType[]>) => void;
};
