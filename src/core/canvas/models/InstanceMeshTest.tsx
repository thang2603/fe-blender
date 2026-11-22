import { useEffect, useMemo } from "react";
import { type BufferGeometry, type Material } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import {
  getCenter,
  selectOnly,
  toggleSelected,
} from "../utils/instanceSelection";
import type { Mesh2 } from "../../stores/type";

type InstanceMeshProps = {
  type: string;
  indexMesh: number;
};

const CAPACITY = 100;

const InstanceMesh = ({ type, indexMesh }: InstanceMeshProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  const { instancesRef, pivotRef } = useCanvasContext();

  const scene = useMemo(() => {
    if (!meshes || !materials) return null;
    const geometry = Object.values(meshes).find((m) => m.isMesh)?.geometry as
      | BufferGeometry
      | undefined;
    const material = Object.values(materials).find((m) => m.isMaterial) as
      | Material
      | undefined;
    if (!geometry || !material) return null;
    return { geometry, material };
  }, [meshes, materials]);

  // Không createEntities: tiết kiệm RAM / GC khi số lượng lớn
  const args = useMemo(
    () =>
      scene
        ? ([
            scene.geometry.clone(),
            scene.material.clone(),
            { capacity: CAPACITY },
          ] as ConstructorParameters<typeof InstancedMesh2>)
        : null,
    [scene],
  );

  // Tạo instance. Thay phần random bằng dữ liệu thật của bạn (nếu bạn đã addInstances ở chỗ khác thì bỏ effect này).
  useEffect(() => {
    const mesh = instancesRef.current[indexMesh] as unknown as
      | InstancedMesh2
      | undefined;
    if (!mesh || !args) return;

    mesh.addInstances(CAPACITY, (obj) => {
      // obj chỉ là entity tạm dùng chung, không được giữ tham chiếu
      obj.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      );
      obj.quaternion.set(0, 0, 0, 1);
      obj.scale.set(1, 1, 1);
    });
    mesh.computeBVH();
  }, [args, indexMesh, instancesRef]);

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const id = event.instanceId;
    if (id === undefined) return;

    const meshesList = instancesRef.current as unknown as InstancedMesh2[];
    if (!meshesList[indexMesh]) return;

    if (event.shiftKey) toggleSelected(meshesList, indexMesh, id);
    else selectOnly(meshesList, indexMesh, id);

    // Đặt pivot ở tâm nhóm đang chọn, reset rotation/scale của pivot
    const pivot = pivotRef.current;
    if (getCenter(meshesList, pivot.position) > 0) {
      pivot.quaternion.identity();
      pivot.scale.set(1, 1, 1);
    }
  };

  if (!args) return null;

  return (
    <instancedMesh2
      args={args}
      onClick={onClick}
      ref={(el) => {
        instancesRef.current[indexMesh] = el as Mesh2;
      }}
    />
  );
};

export default InstanceMesh;
