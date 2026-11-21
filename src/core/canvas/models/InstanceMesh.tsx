import { useMemo } from "react";
import type { BufferGeometry, Material } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import { snapshotInstance } from "../utils/instanceSelection";
import type { Entity, Mesh2 } from "../../stores/type";

type InstanceMeshProps = {
  type: string;
  indexMesh: number;
};

const count = 100;
const InstanceMesh = ({ type, indexMesh }: InstanceMeshProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  const { instancesRef, transformsRef, pivotRef } = useCanvasContext();

  const scene = useMemo(() => {
    if (!meshes || !materials) return null;
    return {
      geometry: Object.values(meshes).find((mesh) => mesh.isMesh)
        ?.geometry as BufferGeometry,
      material: Object.values(materials).find(
        (material) => material.isMaterial,
      ) as Material,
    };
  }, [meshes, materials]);

  const args = useMemo(
    () =>
      [
        scene?.geometry.clone(),
        scene?.material.clone(),
        { capacity: count, createEntities: false },
      ] as ConstructorParameters<typeof InstancedMesh2>,
    [scene],
  );

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;

    const ref = instancesRef.current[indexMesh];
    if (!ref) return;
  };

  return (
    <instancedMesh2
      args={args}
      onClick={onClick}
      ref={(el) => (instancesRef.current[indexMesh] = el as Mesh2)}
    />
  );
};

export default InstanceMesh;
