import { useMemo } from "react";
import { BufferGeometry, Material, Vector3 } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { InstanceType } from "../../stores/type";
import useCanvasStore from "../../stores/useCanvasStore";
import { INIT_POSITION, INSTANCE_TYPES } from "../constants/data";

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
    const length = INSTANCE_TYPES.length;
    const oldCenter = useCanvasStore.getState().center;
    let totalInstances = 0;
    for (let i = 0; i < length; i++) {
      const mesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const lengthInstances = mesh?.instancesCount;
      for (let j = 0; j < lengthInstances; j++) {
        const pos = mesh.instances[j].position.clone().add(oldCenter);
        newCenter.add(pos);
      }
      totalInstances = totalInstances + lengthInstances;
    }
    return newCenter.divideScalar(totalInstances).clone();
  };

  const updateTransform = (center: Vector3) => {
    if (!transformRef.current) return;
    const oldCenter = useCanvasStore.getState().center;
    const length = transformRef?.current?.children?.length;
    for (let i = 0; i < length; i++) {
      const mesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      mesh.updateInstances((obj) => {
        obj.position.copy(obj.position.clone().add(oldCenter).sub(center));
        obj.visible = true;
      });
      mesh.computeBVH();
    }
    setCenter(center);
  };

  const clearInstanceTransform = () => {
    const length = INSTANCE_TYPES.length;
    const oldCenter = useCanvasStore.getState().center;
    for (let i = 0; i < length; i++) {
      const transformMesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const instanceMesh = instancesRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const count = transformMesh.instancesCount;
      if (count > 0) {
        let index = 0;
        instanceMesh.addInstances(count, (obj) => {
          const item = transformMesh.instances[index];
          obj.uuid = item.uuid;
          obj.position.copy(item.position.clone().add(oldCenter));
          obj.scale.copy(item.scale.clone());
          obj.quaternion.copy(item.quaternion.clone());
          index++;
        });
      }
      transformMesh.clearInstances();
    }
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;
    if (!event.shiftKey) {
      clearInstanceTransform();
    }

    const mesh = instancesRef.current.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;

    const transformMesh = transformRef.current.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;
    if (!mesh) return;

    const oldCenter = useCanvasStore.getState().center;
    console.log(oldCenter);
    const instance = mesh.instances[instanceId];
    mesh.removeInstances(instanceId);
    transformMesh.addInstances(1, (obj) => {
      obj.uuid = instance.uuid;
      obj.position.copy(instance.position.clone().sub(oldCenter));
      obj.scale.copy(instance.scale.clone());
      obj.quaternion.copy(instance.quaternion.clone());
      obj.visible = false;
    });
    const newCenter = caculateCenter().clone();
    updateTransform(newCenter);
  };

  return <instancedMesh2 args={args} onClick={(e) => onClick(e)} />;
};

export default InstanceMesh;
