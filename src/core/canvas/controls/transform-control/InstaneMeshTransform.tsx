import { useGLTF } from "@react-three/drei";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useMemo, useRef } from "react";
import type { BufferGeometry, Material } from "three";
import type { InstanceType } from "../../../stores/type";

type InstaneMeshTransformProps = {
  type: string;
};
const count = 100;
const InstaneMeshTransform = ({ type }: InstaneMeshTransformProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  const ref = useRef<InstancedMesh2<InstanceType>>(null!);

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
        { capacity: count, createEntities: true },
      ] as ConstructorParameters<typeof InstancedMesh2>,
    [scene],
  );

  return <instancedMesh2 args={args} ref={ref} />;
};

export default InstaneMeshTransform;
