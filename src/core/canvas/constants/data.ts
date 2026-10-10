import type { NodeType, VectorType } from "../../stores/type";

export const INIT_POSITION: VectorType = [0, 0, 0];
export const INIT_ROTATION: VectorType = [0, 0, 0];
export const INIT_SCALE: VectorType = [1, 1, 1];
export const INIT_INSTANCE_NODE: NodeType = {
  id: "init_1",
  type: "cube",
  position: INIT_POSITION,
  rotation: INIT_ROTATION,
  scale: INIT_SCALE,
  color: "#ffffff",
};
