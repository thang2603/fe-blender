import { useMemo, useRef } from "react";
import {
  Box3,
  Box3Helper,
  BufferGeometry,
  Group,
  Matrix4,
  Vector3,
} from "three";
import type { Object3D } from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull.js";
import { useFrame } from "@react-three/fiber";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { InstanceType } from "../../stores/type";

type Mesh2 = InstancedMesh2<InstanceType>;

const _mat = new Matrix4();
const _v = new Vector3();

// Cache điểm hull theo geometry: chỉ tính 1 lần cho mỗi loại model
const hullCache = new WeakMap<BufferGeometry, Vector3[]>();

const getHullPoints = (geometry: BufferGeometry): Vector3[] => {
  const cached = hullCache.get(geometry);
  if (cached) return cached;

  const attr = geometry.getAttribute("position");
  const all: Vector3[] = [];
  for (let i = 0; i < attr.count; i++) {
    all.push(new Vector3().fromBufferAttribute(attr, i));
  }

  let result = all;
  try {
    const hull = new ConvexHull().setFromPoints(all);
    const unique = new Set<Vector3>();
    for (const face of hull.faces) {
      let edge = face.edge;
      do {
        unique.add(edge.head().point);
        edge = edge.next;
      } while (edge !== face.edge);
    }
    if (unique.size >= 4) result = Array.from(unique);
  } catch {
    // Geometry phẳng / suy biến: dùng toàn bộ đỉnh
  }

  hullCache.set(geometry, result);
  return result;
};

/**
 * Box bao khít tất cả instance active trong transformGroup (hệ local của group).
 * Biến đổi đỉnh hull của từng instance bằng position + quaternion + scale riêng.
 */
const computeSelectionBox = (transformGroup: Object3D, target: Box3) => {
  target.makeEmpty();

  for (const child of transformGroup.children) {
    const mesh = child as Mesh2;
    const list = mesh.instances;
    const geometry = mesh.geometry;
    if (!list || !geometry) continue;

    const points = getHullPoints(geometry);

    for (let i = 0; i < list.length; i++) {
      const inst = list[i];
      if (!inst || !inst.active) continue; // bỏ qua id đã remove

      _mat.compose(inst.position, inst.quaternion, inst.scale);
      for (let p = 0; p < points.length; p++) {
        _v.copy(points[p]).applyMatrix4(_mat);
        target.expandByPoint(_v);
      }
    }
  }

  return target;
};

// Box local dùng chung, export để làm snap
const selectionLocalBox = new Box3();

type SelectionBoxProps = {
  color?: string;
};

const SelectionBox = ({ color = "#00aaff" }: SelectionBoxProps) => {
  const { transformRef } = useCanvasContext();
  const boxGroupRef = useRef<Group>(null);

  const helper = useMemo(() => {
    const h = new Box3Helper(selectionLocalBox, color);
    h.frustumCulled = false;
    h.visible = false;
    return h;
  }, [color]);

  useFrame(() => {
    const group = transformRef.current;
    const boxGroup = boxGroupRef.current;
    if (!group || !boxGroup) return;

    computeSelectionBox(group, selectionLocalBox);
    // helper.visible = !selectionLocalBox.isEmpty();

    // Bám theo transform của group (TransformControls)
    boxGroup.position.copy(group.position);
    boxGroup.quaternion.copy(group.quaternion);
    boxGroup.scale.copy(group.scale);
  });

  return (
    <group ref={boxGroupRef}>
      <primitive object={helper} />
    </group>
  );
};

export default SelectionBox;
