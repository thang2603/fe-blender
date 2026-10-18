import { useMemo, useRef } from "react";
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

const count = 10;
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
        scene?.geometry,
        scene?.material,
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

    mesh.setOpacityAt(instanceId, 0.5);

    console.log(mesh.instances[instanceId]);

    const instance = mesh.instances[instanceId];
    const obj: NodeType = {
      id: instance.uuid,
      type,
      position: instance.position.clone().toArray(),
      quaternion: instance.quaternion.clone().toArray(),
      scale: instance.scale.clone().toArray(),
      color: "",
      instanceId,
    };

    selectInstances(obj);

    // else if(event.ctrlKey){
    //   toggleInstance()
    // }
    // else if(event.altKey){
    //   deselectInstance()
    // }
  };

  return <instancedMesh2 ref={ref} args={args} onClick={(e) => onClick(e)} />;
};

export default InstanceMesh;
