import { Quaternion, Vector3 } from "three";
import type { NodeType } from "../../stores/type";

export const INIT_POSITION: Vector3 = new Vector3(0, 0, 0);
export const INIT_QUATERNION: Quaternion = new Quaternion(0, 0, 0, 1);
export const INIT_SCALE: Vector3 = new Vector3(1, 1, 1);
export const INIT_INSTANCE_NODE: NodeType = {
  id: "init_1",
  type: "cube",
  position: INIT_POSITION,
  quaternion: INIT_QUATERNION,
  scale: INIT_SCALE,
  color: "#ffffff",
  instanceId: 0,
};

export const INSTANCE_TYPES = [
  {
    type: "cube",
  },
  {
    type: "sphere",
  },
];
