import type { Mesh2 } from "../../stores/type";
import { Vector3 } from "three";
import useCanvasStore from "../../stores/useCanvasStore";
import { generateUniqueId } from "./helper";

/** Lấy ra center của các instance được chọn */
import * as THREE from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { INSTANCE_TYPES } from "../constants/data";

// Mỗi loại mesh có 1 Set id đang chọn
export const selectedIds: Set<number>[] = INSTANCE_TYPES.map(
  () => new Set<number>(),
);

const WHITE = new THREE.Color(1, 1, 1); // màu instance = trắng -> giữ nguyên màu material
const SELECT_COLOR = new THREE.Color("#ff7a00");

const _m = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _sum = new THREE.Vector3();

const paint = (
  mesh: InstancedMesh2 | undefined,
  id: number,
  selected: boolean,
) => {
  mesh?.setColorAt(id, selected ? SELECT_COLOR : WHITE);
};

export const isSelected = (meshIndex: number, id: number) =>
  selectedIds[meshIndex].has(id);

export const setSelected = (
  meshes: InstancedMesh2[],
  meshIndex: number,
  id: number,
  selected: boolean,
) => {
  const set = selectedIds[meshIndex];
  if (selected) set.add(id);
  else set.delete(id);
  paint(meshes[meshIndex], id, selected);
};

export const toggleSelected = (
  meshes: InstancedMesh2[],
  meshIndex: number,
  id: number,
) => {
  setSelected(meshes, meshIndex, id, !selectedIds[meshIndex].has(id));
};

// Chỉ repaint những id đã chọn, không duyệt toàn bộ instance
export const clearSelected = (meshes: InstancedMesh2[]) => {
  for (let i = 0; i < selectedIds.length; i++) {
    const set = selectedIds[i];
    if (set.size === 0) continue;
    for (const id of set) paint(meshes[i], id, false);
    set.clear();
  }
};

export const selectOnly = (
  meshes: InstancedMesh2[],
  meshIndex: number,
  id: number,
) => {
  clearSelected(meshes);
  setSelected(meshes, meshIndex, id, true);
};

export const getSelectedCount = () =>
  selectedIds.reduce((n, s) => n + s.size, 0);

// Tâm của các instance đang chọn, O(K). Trả về số instance đã chọn.
export const getCenter = (meshes: InstancedMesh2[], target: THREE.Vector3) => {
  _sum.set(0, 0, 0);
  let n = 0;
  for (let i = 0; i < selectedIds.length; i++) {
    const mesh = meshes[i];
    if (!mesh) continue;
    for (const id of selectedIds[i]) {
      mesh.getMatrixAt(id, _m);
      _pos.setFromMatrixPosition(_m);
      _sum.add(_pos);
      n++;
    }
  }
  if (n > 0) target.copy(_sum).divideScalar(n);
  return n;
};

// Gọi khi xóa instance để Set không giữ id cũ
export const removeFromSelection = (meshIndex: number, id: number) => {
  selectedIds[meshIndex].delete(id);
};

// addInstances: giữ nguyên như bản bạn đang có
export const addInstances = (
  instancesMeshes: Mesh2[],
  mousePosition: Vector3,
  indexByType: Map<number, string>,
) => {
  const addInstances = useCanvasStore.getState().addInstances;

  if (!Object.keys(addInstances).length) return;
  if (!mousePosition) return;
  const length = INSTANCE_TYPES.length;
  for (let i = 0; i < length; i++) {
    const mesh = instancesMeshes[i];

    const type = indexByType.get(i);

    if (!type) continue;
    let data = addInstances?.[type];
    if (!data) continue;

    data = data.map((item) => ({ ...item, id: generateUniqueId() }));
    let index = 0;
    mesh.addInstances(data.length, (obj) => {
      const item = data[index];
      const newPos = mousePosition.clone().add(item.position);
      obj.uuid = item.id;
      obj.position.copy(newPos.clone());
      obj.scale.copy(item.scale.clone());
      obj.quaternion.copy(item.quaternion.clone());
      obj.selected = false;
      index++;
    });
    mesh.computeBVH();
  }
};
