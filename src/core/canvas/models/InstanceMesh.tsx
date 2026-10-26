import { useMemo } from "react";
import { BufferGeometry, Material, Vector3 } from "three";
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
      const lengthInstances = tempMesh?.instancesCount;
      for (let j = 0; j < lengthInstances; j++) {
        const pos = tempMesh.instances[j].oldPosition;
        newCenter.add(pos);
      }
      totalInstances = totalInstances + lengthInstances;
    }
    return newCenter.clone().divideScalar(totalInstances);
  };

  const updateTransform = (center: Vector3) => {
    if (!transformRef.current) return;
    const length = transformRef?.current?.children?.length;
    for (let i = 0; i < length; i++) {
      const tempMesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      tempMesh.updateInstances((obj) => {
        obj.position.copy(obj.oldPosition).sub(center);
        obj.visible = true;
      });
    }
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;

    if (event.shiftKey) {
      console.log(1);
    } else {
      const length = transformRef?.current?.children?.length;
      for (let i = 0; i < length; i++) {
        const transformMeshTemp = transformRef.current.children[
          i
        ] as InstancedMesh2<InstanceType>;
        const instanceMeshTemp = instancesRef.current.children[
          i
        ] as InstancedMesh2<InstanceType>;
        const count = transformMeshTemp.instancesCount;
        if (count > 0) {
          let index = 0;
          instanceMeshTemp.addInstances(count, (obj) => {
            const item = transformMeshTemp.instances[index];
            obj.uuid = item.uuid;
            obj.position.set(...item.oldPosition.clone().toArray());
            obj.scale.set(...item.scale.clone().toArray());
            obj.quaternion.set(...item.quaternion.clone().toArray());
            obj.color = "red";
            index++;
          });
        }
        transformMeshTemp.clearInstances();
      }
    }

    //
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
      obj.visible = false;
    });
    const newCenter = caculateCenter().clone();
    setCenter(newCenter);
    updateTransform(newCenter);
  };

  return <instancedMesh2 args={args} onClick={(e) => onClick(e)} />;
};

export default InstanceMesh;
