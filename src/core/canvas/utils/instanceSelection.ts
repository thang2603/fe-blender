import type { Entity, InstanceSnapshot, Mesh2 } from "../../stores/type";
import { Matrix4, Quaternion, Vector3, type Object3D } from "three";
import useCanvasStore from "../../stores/useCanvasStore";
import {
  INIT_POSITION,
  INIT_QUATERNION,
  INIT_SCALE,
  INSTANCE_TYPES,
} from "../constants/data";
import { generateUniqueId } from "./helper";

// const _p = new Vector3();
// const _q = new Quaternion();
// const _s = new Vector3();

/** Lấy ra center của các instance được chọn */
export const getCenter = (instancesMeshes: Mesh2[]) => {
  const center = INIT_POSITION.clone();
  let count = 0;
  const length = INSTANCE_TYPES.length;
  for (let i = 0; i < length; i++) {
    const mesh = instancesMeshes[i];
    if (!mesh) continue;
    const instances = mesh.instances;
    if (!instances) continue;
    for (const inst of instances) {
      if (inst.selected && inst.active) {
        center.add(inst.position);
        count++;
      }
    }
  }
  if (count > 0) {
    center.divideScalar(count);
  }
  return center;
};

/** Copy dữ liệu ra khỏi entity (entity là proxy vào buffer, không giữ lâu được) */
export const snapshotInstance = (inst: Entity): InstanceSnapshot => ({
  uuid: inst.uuid,
  position: inst.position.clone(),
  quaternion: inst.quaternion.clone(),
  scale: inst.scale.clone(),
});

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
      index++;
    });
    mesh.computeBVH();
  }
};
