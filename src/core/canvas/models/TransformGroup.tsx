import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { TransformMode } from "../../stores/type";
import {
  INIT_POSITION,
  INIT_QUATERNION,
  INIT_SCALE,
  INSTANCE_TYPES,
} from "../constants/data";
import { Matrix4, Quaternion, Vector3 } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};

type Group = {
  meshIndex: number;
  ids: Int32Array;
  trs: Float32Array;
};
const MIN_SCALE = 1e-4;
const STRIDE = 10; // p(3) + q(4) + s(3)
const _m = new Matrix4();
const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();
const _deltaPos = new Vector3();
const _deltaScale = new Vector3();
const _logD = new Vector3();
const _deltaQuat = new Quaternion();
const _invQuat = new Quaternion();

const TransformGroup = () => {
  const { pivotRef, instancesRef, selectedIdsRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");

  const startPivotPos = useRef(INIT_POSITION.clone());
  const startPivotQuat = useRef(INIT_QUATERNION.clone());
  const startPivotScale = useRef(INIT_SCALE.clone());

  const groups = useRef<Group[]>([]);
  const dragging = useRef(false);

  const getMeshes = () => instancesRef.current as unknown as InstancedMesh2[];

  const handleStart = () => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    startPivotPos.current.copy(pivot.position);
    startPivotQuat.current.copy(pivot.quaternion);
    startPivotScale.current.copy(pivot.scale);
    const selectedIds = selectedIdsRef.current;
    const meshes = getMeshes();
    const list: Group[] = [];
    for (let i = 0; i < selectedIds.length; i++) {
      const mesh = meshes[i];
      const set = selectedIds[i];
      if (!mesh || set.size === 0) continue;

      const ids = new Int32Array(set.size);
      const trs = new Float32Array(set.size * STRIDE);

      let k = 0;
      for (const id of set) {
        ids[k] = id;
        mesh.getMatrixAt(id, _m);
        _m.decompose(_p, _q, _s);
        _p.toArray(trs, k * STRIDE);
        _q.normalize().toArray(trs, k * STRIDE + 3);
        _s.toArray(trs, k * STRIDE + 7);
        k++;
      }
      list.push({ meshIndex: i, ids, trs });
    }
    groups.current = list;
    dragging.current = list.length > 0;
  };

  const handleEnd = () => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    dragging.current = false;

    // Cập nhật BVH một lần cho các instance đã di chuyển.
    // Một số version của setMatrixAt đã tự gọi bvh.move, nếu bạn thấy bị gọi 2 lần thì bỏ đoạn này.
    const meshes = getMeshes();
    for (const { meshIndex, ids } of groups.current) {
      const bvh = (meshes[meshIndex] as any)?.bvh;
      if (!bvh?.move) continue;
      for (let k = 0; k < ids.length; k++) bvh.move(ids[k]);
    }
    groups.current = [];

    // Reset rotation/scale của pivot để lần kéo sau bắt đầu từ identity
    pivot.quaternion.identity();
    pivot.scale.set(1, 1, 1);
    startPivotPos.current.copy(pivot.position);
    startPivotQuat.current.identity();
    startPivotScale.current.set(1, 1, 1);
  };

  const handleChange = () => {
    if (!dragging.current) return;
    const pivot = pivotRef.current;
    if (!pivot) return;

    const origin = startPivotPos.current;

    // delta so với lúc mouseDown (không cộng dồn)
    _deltaPos.copy(pivot.position).sub(origin);

    _deltaQuat
      .copy(pivot.quaternion)
      .multiply(_invQuat.copy(startPivotQuat.current).invert())
      .normalize();

    _deltaScale.copy(pivot.scale).divide(startPivotScale.current);
    _deltaScale.x = Math.max(_deltaScale.x, MIN_SCALE);
    _deltaScale.y = Math.max(_deltaScale.y, MIN_SCALE);
    _deltaScale.z = Math.max(_deltaScale.z, MIN_SCALE);
    _logD.set(
      Math.log(_deltaScale.x),
      Math.log(_deltaScale.y),
      Math.log(_deltaScale.z),
    );

    const meshes = getMeshes();

    for (const { meshIndex, ids, trs } of groups.current) {
      const mesh = meshes[meshIndex];
      if (!mesh) continue;

      for (let k = 0; k < ids.length; k++) {
        const o = k * STRIDE;
        _p.fromArray(trs, o);
        _q.fromArray(trs, o + 3);
        _s.fromArray(trs, o + 7);

        switch (mode) {
          case "translate":
            _p.add(_deltaPos);
            break;

          case "rotate":
            _p.sub(origin).applyQuaternion(_deltaQuat).add(origin);
            _q.premultiply(_deltaQuat).normalize();
            break;

          case "scale": {
            // vị trí giãn theo pivot (world)
            _p.sub(origin).multiply(_deltaScale).add(origin);

            // đổi hệ số giãn từ trục world sang trục local của instance
            const e = _m.makeRotationFromQuaternion(_q).elements;
            const fx = Math.exp(
              e[0] * e[0] * _logD.x +
                e[1] * e[1] * _logD.y +
                e[2] * e[2] * _logD.z,
            );
            const fy = Math.exp(
              e[4] * e[4] * _logD.x +
                e[5] * e[5] * _logD.y +
                e[6] * e[6] * _logD.z,
            );
            const fz = Math.exp(
              e[8] * e[8] * _logD.x +
                e[9] * e[9] * _logD.y +
                e[10] * e[10] * _logD.z,
            );
            _s.x *= fx;
            _s.y *= fy;
            _s.z *= fz;
            break;
          }
        }

        _m.compose(_p, _q, _s);
        mesh.setMatrixAt(ids[k], _m);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case KEY_MODE.POSITION:
          setMode("translate");
          break;
        case KEY_MODE.ROTATION:
          setMode("rotate");
          break;
        case KEY_MODE.SCALE:
          setMode("scale");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <object3D ref={pivotRef} position={[0, 0, 0]} />
      <TransformControls
        object={pivotRef}
        mode={mode}
        space={mode === "scale" ? "local" : "world"}
        onMouseDown={handleStart}
        onObjectChange={handleChange}
        onMouseUp={handleEnd}
      />
    </>
  );
};

export default TransformGroup;
