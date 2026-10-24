import { useMemo } from "react";
import { BufferGeometry, Material } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { InstanceType } from "../../stores/type";
import useCanvasStore from "../../stores/useCanvasStore";
import { INIT_POSITION } from "../constants/data";

type InstanceMeshProps = {
  type: string;
  indexMesh: number;
};

const count = 100;
const InstanceMesh = ({ type, indexMesh }: InstanceMeshProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  const { instancesRef, transformRef } = useCanvasContext();
  const setCenter = useCanvasStore((state) => state.setCenter);
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

  const caculateCenter = () => {
    const newCenter = INIT_POSITION.clone();
    const length = transformRef.current.children.length;
    let totalInstances = 0;
    for (let i = 0; i < length; i++) {
      const tempMesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const lengthInstances = tempMesh?.instances?.length;
      if (lengthInstances > 0) {
        for (let j = 0; j < lengthInstances; j++) {
          const pos = tempMesh.instances[j].position;
          newCenter.add(pos);
        }
        totalInstances = totalInstances + lengthInstances;
      }
    }

    setCenter(newCenter.divideScalar(totalInstances).clone());
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;
    const mesh = instancesRef.current.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;

    const transformMesh = transformRef.current.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;
    if (!mesh) return;

    const instance = mesh.instances[instanceId];

    mesh.removeInstances(instanceId);
    transformMesh.addInstances(1, (obj) => {
      obj.uuid = instance.uuid;
      obj.position.set(...instance.position.clone().toArray());
      obj.scale.set(...instance.scale.clone().toArray());
      obj.quaternion.set(...instance.quaternion.clone().toArray());
      obj.oldPosition = instance.position.clone();
    });
    caculateCenter();
  };

  return <instancedMesh2 args={args} onClick={(e) => onClick(e)} />;
};

export default InstanceMesh;
