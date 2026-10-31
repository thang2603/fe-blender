import { Quaternion, Vector3 } from "three";
import type { Object3D } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { InstanceType } from "../../stores/type";
// import useCanvasStore from "../../stores/useCanvasStore";
import { INIT_POSITION, INSTANCE_TYPES } from "../constants/data";
import useCanvasStore from "../../stores/useCanvasStore";
import { generateUniqueId } from "./helper";

export type Mesh2 = InstancedMesh2<InstanceType>;
export type Entity = NonNullable<Mesh2["instances"]>[number];

export type InstanceSnapshot = {
  uuid: string;
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

/** Chỉ lấy các instance đang active (bỏ qua id bị thủng do removeInstances) */
export const getActiveInstances = (mesh: Mesh2): Entity[] => {
  const result: Entity[] = [];
  const list = mesh?.instances;
  if (!list) return result;
  for (let i = 0; i < list.length; i++) {
    const inst = list[i];
    if (inst && inst.active) result.push(inst);
  }
  return result;
};

/** Copy dữ liệu ra khỏi entity (entity là proxy vào buffer, không giữ lâu được) */
export const snapshotInstance = (inst: Entity): InstanceSnapshot => ({
  uuid: inst.uuid,
  position: inst.position.clone(),
  quaternion: inst.quaternion.clone(),
  scale: inst.scale.clone(),
});

export const calculateCenter = (transformGroup: Object3D): Vector3 => {
  const center = transformGroup.position.clone();
  const sum = new Vector3();
  let total = 0;

  for (const child of transformGroup.children) {
    const instances = getActiveInstances(child as Mesh2);
    for (const inst of instances) {
      sum.add(inst.position).add(center); // local -> world
      total++;
    }
  }

  // Không còn instance nào -> tránh chia cho 0 (NaN)
  if (total === 0) return INIT_POSITION.clone();
  return sum.divideScalar(total);
};

export const updateTransform = (
  transformGroup: Object3D,
  newCenter: Vector3,
) => {
  const oldCenter = transformGroup.position.clone();

  for (const child of transformGroup.children) {
    const mesh = child as Mesh2;
    mesh.updateInstances((obj) => {
      if (!obj.active) return;
      obj.position.add(oldCenter).sub(newCenter);
      obj.visible = true;
    });
    mesh.computeBVH();
  }

  // Dời group ngay trong cùng tick, tránh lệch 1 frame so với instance
  transformGroup.position.copy(newCenter);
  transformGroup.updateMatrixWorld(true);
};
/** Trả toàn bộ instance từ transform mesh về instances mesh (world space) */
export const clearInstanceTransform = (
  transformGroup: Object3D,
  instancesGroup: Object3D,
  keep?: { mesh: Mesh2; id: number }, // instance được giữ lại, không đụng tới
) => {
  //   const center = useCanvasStore.getState().center.clone();
  const center = transformGroup.position.clone();

  transformGroup.children.forEach((child, i) => {
    const transformMesh = child as Mesh2;
    const instanceMesh = instancesGroup.children[i] as Mesh2 | undefined;
    if (!instanceMesh || !transformMesh.instances) return;

    const snapshots: InstanceSnapshot[] = [];
    const ids: number[] = [];

    // Snapshot hết trước khi thay đổi bất kỳ buffer nào
    const list = transformMesh.instances;
    for (let id = 0; id < list.length; id++) {
      const inst = list[id];
      if (!inst || !inst.active) continue;
      if (keep && keep.mesh === transformMesh && keep.id === id) continue;

      const s = snapshotInstance(inst);
      s.position.add(center); // local -> world
      snapshots.push(s);
      ids.push(id);
    }

    if (snapshots.length === 0) return;

    let k = 0;
    instanceMesh.addInstances(snapshots.length, (obj) => {
      const s = snapshots[k++];
      obj.uuid = s.uuid;
      obj.position.copy(s.position);
      obj.quaternion.copy(s.quaternion);
      obj.scale.copy(s.scale);
      obj.visible = true;
    });

    transformMesh.removeInstances(...ids);
  });
};

export const selectAll = (
  transformGroup: Object3D,
  instancesGroup: Object3D,
) => {
  // Dùng center trong store, cùng nguồn với calculateCenter / updateTransform
  const oldCenter = transformGroup.position.clone();

  transformGroup.children.forEach((child, i) => {
    const transformMesh = child as Mesh2;
    const mesh = instancesGroup.children[i] as Mesh2 | undefined;
    if (!mesh || !mesh.instances) return;

    // 1. Snapshot toàn bộ instance active (bỏ qua id bị thủng), world -> local
    const snapshots: InstanceSnapshot[] = [];
    const ids: number[] = [];
    const list = mesh.instances;
    for (let id = 0; id < list.length; id++) {
      const inst = list[id];
      if (!inst || !inst.active) continue;
      const s = snapshotInstance(inst);
      s.position.sub(oldCenter);
      snapshots.push(s);
      ids.push(id);
    }

    if (snapshots.length === 0) return;

    // 2. Thêm vào transform mesh
    let k = 0;
    transformMesh.addInstances(snapshots.length, (obj) => {
      const s = snapshots[k++];
      obj.uuid = s.uuid;
      obj.position.copy(s.position);
      obj.quaternion.copy(s.quaternion);
      obj.scale.copy(s.scale);
      obj.visible = false; // updateTransform sẽ bật lại
    });

    // 3. Xóa đúng các id đã chuyển khỏi mesh thường
    mesh.removeInstances(...ids);
  });

  updateTransform(transformGroup, calculateCenter(transformGroup));
};

export const deselectAll = (
  transformGroup: Object3D,
  instancesGroup: Object3D,
) => {
  // Trả toàn bộ instance đang chọn về mesh thường (local + center -> world)
  clearInstanceTransform(transformGroup, instancesGroup);

  // Không còn gì được chọn: đưa center và group về gốc mặc định
  const resetCenter = INIT_POSITION.clone();
  transformGroup.position.copy(resetCenter);
  transformGroup.updateMatrixWorld(true);
};

export const addInstances = (
  instancesGroup: Object3D,
  mousePosition: Vector3,
  indexByType: Map<number, string>,
) => {
  const addInstances = useCanvasStore.getState().addInstances;

  if (!Object.keys(addInstances).length) return;
  if (!mousePosition) return;
  const length = INSTANCE_TYPES.length;
  for (let i = 0; i < length; i++) {
    const mesh = instancesGroup.children[i] as Mesh2;

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
      index++;
    });
    mesh.computeBVH();
  }
};
