import type { InstanceType } from "../../stores/type";
import { Matrix4, Quaternion, Vector3, type Object3D } from "three";
import useCanvasStore from "../../stores/useCanvasStore";
import {
  INIT_POSITION,
  INIT_QUATERNION,
  INIT_SCALE,
  INSTANCE_TYPES,
} from "../constants/data";
import { generateUniqueId } from "./helper";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";

export type Mesh2 = InstancedMesh2<InstanceType>;
export type Entity = NonNullable<Mesh2["instances"]>[number];

export type InstanceSnapshot = {
  uuid: string;
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();

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
  const center = INIT_POSITION.clone();
  let total = 0;
  transformGroup.children.forEach((child) => {
    const mesh = child as Mesh2;
    const list = getActiveInstances(mesh);
    total += list.length;
    list.forEach((inst) => {
      inst.matrixWorld.decompose(_p, _q, _s);
      center.add(_p.clone());
    });
  });
  if (total > 0) {
    center.divideScalar(total);
  }
  return center;
};

export const updateTransform = (transformGroup: Object3D) => {
  const newCenter = calculateCenter(transformGroup);

  transformGroup.children.forEach((child) => {
    const mesh = child as Mesh2;
    mesh.updateInstances((obj) => {
      const isActive = obj.active;

      if (isActive) {
        obj.matrixWorld.decompose(_p, _q, _s);
        console.log(_p.clone(), _q.clone(), _s.clone());
        obj.position.copy(_p.clone().sub(newCenter));
        obj.quaternion.copy(_q.clone());
        obj.scale.copy(_s.clone());
      }
    });
    mesh.computeBVH();
    mesh.updateMatrixWorld(true);
  });
  transformGroup.position.copy(newCenter.clone());
  transformGroup.quaternion.copy(INIT_QUATERNION.clone());
  transformGroup.scale.copy(INIT_SCALE.clone());
  transformGroup.updateMatrixWorld(true);
};

// addInstances: giữ nguyên như bản bạn đang có
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

export function getLocalTransform(
  mesh: { position: Vector3; quaternion: Quaternion; scale: Vector3 },
  group: { position: Vector3; quaternion: Quaternion; scale: Vector3 },
) {
  // Bước 1: dựng ma trận cho mesh (đây là world mong muốn)
  const meshMatrix = new Matrix4().compose(
    new Vector3(...mesh.position),
    new Quaternion(...mesh.quaternion),
    new Vector3(...mesh.scale),
  );

  // Bước 2: dựng ma trận cho group
  const groupMatrix = new Matrix4().compose(
    new Vector3(...group.position),
    new Quaternion(...group.quaternion),
    new Vector3(...group.scale),
  );

  // Bước 3: local = inverse(group) × mesh
  const localMatrix = groupMatrix.clone().invert().multiply(meshMatrix);

  localMatrix.decompose(_p, _q, _s);

  return {
    position: _p.clone(),
    quaternion: _q.clone(),
    scale: _s.clone(),
  };
}
