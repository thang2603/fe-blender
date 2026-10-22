import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Material } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import useShortCut from "../hooks/useShortCut";
import { useGLTF } from "@react-three/drei";
import type { InstanceType, NodeType } from "../../stores/type";
import type { ThreeEvent } from "@react-three/fiber";
import useCanvasStore from "../../stores/useCanvasStore";

type InstanceMeshProps = {
  type: string;
};

const count = 100;
const InstanceMesh = ({ type }: InstanceMeshProps) => {
  const ref = useRef<InstancedMesh2<InstanceType>>(null!);
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  useShortCut({ ref, type });
  const selectInstances = useCanvasStore((state) => state.selectInstance);
  // const toggleInstance = useCanvasStore((state) => state.selectInstances);
  // const deselectInstance = useCanvasStore((state) => state.selectInstances);

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

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const mesh = ref.current;
    if (!mesh) return;
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;
    (mesh.material as Material).transparent = true;
    const instance = mesh.instances[instanceId];

    const obj: NodeType = {
      id: instance.uuid,
      type,
      position: instance.position.clone(),
      quaternion: instance.quaternion.clone(),
      scale: instance.scale.clone(),
      color: "",
      opacity: instance.opacity,
      instanceId,
    };
    instance.scale.set(0, 0, 0);
    mesh.setVisibilityAt(instanceId, false);
    console.log(mesh);
    selectInstances(obj);
  };
  useEffect(() => {
    const mesh = ref.current;
    return () => {
      mesh.dispose();
    };
  }, []);

  return <instancedMesh2 ref={ref} args={args} onClick={(e) => onClick(e)} />;
};

export default InstanceMesh;
