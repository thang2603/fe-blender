import { useGLTF } from "@react-three/drei";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import useCanvasStore from "../../stores/useCanvasStore";

type CustomData = { uuid: string };
type InstanceMeshProps = {
  type: string;
};
const InstanceMesh = ({ type = "cube" }: InstanceMeshProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  // const instanceIdRef = useRef<Map<string, string>>(new Map());

  const instanceAdded = useCanvasStore((state) => state.instanceAdded);

  const meshRef = useRef<InstancedMesh2<CustomData>>(null);
  const scene = useMemo(() => {
    if (!meshes || !materials) return null;
    return {
      geometry: Object.values(meshes).find((mesh) => mesh.isMesh)
        ?.geometry as THREE.BufferGeometry,
      material: Object.values(materials).find(
        (material) => material.isMaterial,
      ) as THREE.Material,
    };
  }, [meshes, materials]);

  const instanceMesh = useMemo(() => {
    if (!scene) return null;
    const mesh = new InstancedMesh2<CustomData>(
      scene.geometry,
      scene.material,
      {
        capacity: 100,
        createEntities: true,
      },
    );
    return mesh;
  }, [scene]);

  // add
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const count = instanceAdded.length;
    if (count === 0) return;
    const instanceCount = mesh.instancesCount;
    console.log("instanceCount", instanceCount);
    mesh.addInstances(count, (obj, index) => {
      const { id, position, rotation, scale, color } =
        instanceAdded[index - instanceCount];
      obj.uuid = id;
      obj.position.set(...position);

      obj.quaternion.set(...rotation, 1);
      obj.scale.set(...scale);
      obj.color = color;
    });
    mesh.computeBVH();
  }, [instanceAdded]);

  return instanceMesh ? (
    <primitive ref={meshRef} object={instanceMesh} />
  ) : null;
};

export default InstanceMesh;
