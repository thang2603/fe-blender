import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { INIT_POSITION } from "../constants/data";
import { Matrix4, Vector3 } from "three";

const _m = new Matrix4();
const _pos = new Vector3();
export const isSelected = (
  selectedIds: Set<number>[],
  meshIndex: number,
  id: number,
) => {
  return selectedIds[meshIndex].has(id);
};

export const clearSelected = (selectedIds: Set<number>[]) => {
  const length = selectedIds.length;
  for (let i = 0; i < length; i++) {
    const set = selectedIds[i];
    if (set.size === 0) continue;
    set.clear();
  }
};

export const toggleSelected = (
  selectedIds: Set<number>[],
  meshIndex: number,
  id: number,
) => {
  const isSelect = isSelected(selectedIds, meshIndex, id);
  const set = selectedIds[meshIndex];
  if (!isSelect) set.add(id);
  else set.delete(id);
};

export const selectOnly = (
  selectedIds: Set<number>[],
  meshIndex: number,
  id: number,
) => {
  clearSelected(selectedIds);
  selectedIds[meshIndex].add(id);
};

export const getCenter = (
  selectedIds: Set<number>[],
  meshes: InstancedMesh2[],
) => {
  const center = INIT_POSITION.clone();
  let count = 0;
  for (let i = 0; i < selectedIds.length; i++) {
    const mesh = meshes[i];
    if (!mesh) continue;
    for (const id of selectedIds[i]) {
      mesh.getMatrixAt(id, _m);
      _pos.setFromMatrixPosition(_m);
      center.add(_pos);
      count++;
    }
  }
  if (count > 0) center.divideScalar(count);
  return center.clone();
};
