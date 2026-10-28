import { useGLTF } from "@react-three/drei";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useMemo } from "react";
import type { BufferGeometry, Material } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { InstanceType } from "../../stores/type";
import {
  calculateCenter,
  clearInstanceTransform,
  snapshotInstance,
  updateTransform,
} from "../utils/instanceSelection";

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

    const instanceId = event.instanceId;
    if (instanceId === undefined) return;

    const instancesGroup = instancesRef.current;
    const transformGroup = transformRef.current;
    if (!instancesGroup || !transformGroup) return;

    const mesh = instancesGroup.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;
    const transformMesh = transformGroup.children[
      indexMesh
    ] as InstancedMesh2<InstanceType>;
    if (!mesh || !transformMesh) return;

    const instance = transformMesh.instances?.[instanceId];
    if (!instance || !instance.active) return;
    if (event.shiftKey) {
      const snap = snapshotInstance(instance);
      const oldCenter = transformGroup.position.clone();
      transformMesh.removeInstances(instanceId);
      mesh.addInstances(1, (obj) => {
        obj.uuid = snap.uuid;
        obj.position.copy(snap.position).add(oldCenter);
        obj.quaternion.copy(snap.quaternion);
        obj.scale.copy(snap.scale);
        obj.visible = true;
      });
    } else {
      clearInstanceTransform(transformGroup, instancesGroup, {
        mesh: transformMesh,
        id: instanceId,
      });
    }
    const newCenter = calculateCenter(transformGroup);
    updateTransform(transformGroup, newCenter);
  };
  return <instancedMesh2 args={args} onClick={onClick} />;
};

export default InstaneMeshTransform;
