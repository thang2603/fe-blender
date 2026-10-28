import { Quaternion, Vector3 } from "three";
import type { Object3D } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { InstanceType } from "../../stores/type";
// import useCanvasStore from "../../stores/useCanvasStore";
import { INIT_POSITION } from "../constants/data";

type Mesh2 = InstancedMesh2<InstanceType>;
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
  //   const center = useCanvasStore.getState().center;
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
  //   const oldCenter = useCanvasStore.getState().center.clone();
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

  //   useCanvasStore.getState().setCenter(newCenter.clone());
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
