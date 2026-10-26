import { useGLTF } from "@react-three/drei";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useMemo } from "react";
import type { BufferGeometry, Material, Vector3 } from "three";
import type { InstanceType } from "../../../stores/type";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../../hooks/useCanvasContext";
import useCanvasStore from "../../../stores/useCanvasStore";
import { INIT_POSITION, INSTANCE_TYPES } from "../../constants/data";

type InstaneMeshTransformProps = {
  type: string;
  indexMesh: number;
};
const count = 100;
const InstaneMeshTransform = ({
  type,
  indexMesh,
}: InstaneMeshTransformProps) => {
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
    let totalInstances = 0;
    for (let i = 0; i < length; i++) {
      const mesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const lengthInstances = mesh?.instancesCount;
      for (let j = 0; j < lengthInstances; j++) {
        const pos = mesh.instances[j].oldPosition;
        newCenter.add(pos);
      }
      totalInstances = totalInstances + lengthInstances;
    }
    return newCenter.divideScalar(totalInstances).clone();
  };

  const updateTransform = (center: Vector3) => {
    if (!transformRef.current) return;
    const length = transformRef?.current?.children?.length;
    for (let i = 0; i < length; i++) {
      const mesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      mesh.updateInstances((obj) => {
        obj.position.copy(obj.oldPosition).sub(center);
        obj.visible = true;
      });
      mesh.computeBVH();
    }
  };

  const clearInstanceTransform = () => {
    const length = INSTANCE_TYPES.length;
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
          obj.position.set(...item.oldPosition.clone().toArray());
          obj.scale.set(...item.scale.clone().toArray());
          obj.quaternion.set(...item.quaternion.clone().toArray());
          index++;
        });
      }
      transformMesh.clearInstances();
    }
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    console.log("select");
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
    const instance = transformMesh.instances[instanceId];
    if (!event.shiftKey) {
      clearInstanceTransform();

      transformMesh.addInstances(1, (obj) => {
        obj.uuid = instance.uuid;
        obj.position.set(...instance.oldPosition.clone().toArray());
        obj.scale.set(...instance.scale.clone().toArray());
        obj.quaternion.set(...instance.quaternion.clone().toArray());
        obj.oldPosition = instance.position.clone();
        obj.visible = false;
      });
      mesh.removeInstances(instanceId);
    } else {
      console.log("shift");
    }

    const newCenter = caculateCenter().clone();
    updateTransform(newCenter);
    setCenter(newCenter);
  };

  return <instancedMesh2 args={args} onClick={(e) => onClick(e)} />;
};

export default InstaneMeshTransform;
