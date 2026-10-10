import { useMemo, useRef } from "react";
import { BufferGeometry, Material } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import useShortCut from "../hooks/useShortCut";
import { useGLTF } from "@react-three/drei";

type InstanceMeshProps = {
  type: string;
};

const count = 10;
const InstanceMesh = ({ type }: InstanceMeshProps) => {
  const ref = useRef<InstancedMesh2>(null!);
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  useShortCut({ ref, type });

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
        scene?.geometry,
        scene?.material,
        { capacity: count, createEntities: true },
      ] as ConstructorParameters<typeof InstancedMesh2>,
    [scene],
  );

  return <instancedMesh2 ref={ref} args={args} />;
};

export default InstanceMesh;
