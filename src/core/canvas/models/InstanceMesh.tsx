import { useMemo } from "react";
import type { BufferGeometry, Material } from "three";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import "./extend";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { InstanceType } from "../../stores/type";

import {
  getLocalTransform,
  snapshotInstance,
  updateTransform,
} from "../utils/instanceSelection";

type InstanceMeshProps = {
  type: string;
  indexMesh: number;
};

const count = 100;
const InstanceMesh = ({ type, indexMesh }: InstanceMeshProps) => {
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

    const instance = mesh.instances?.[instanceId];
    if (!instance || !instance.active) return;

    // 1. Snapshot (world) và gỡ khỏi mesh thường trước

    const snap = snapshotInstance(instance);
    const value = getLocalTransform(
      {
        position: snap.position,
        quaternion: snap.quaternion,
        scale: snap.scale,
      },
      {
        position: transformGroup.position,
        quaternion: transformGroup.quaternion,
        scale: transformGroup.scale,
      },
    );
    transformMesh.addInstances(1, (obj) => {
      obj.position.copy(value.position);
      obj.quaternion.copy(value.quaternion);
      obj.scale.copy(value.scale);
    });
    transformMesh.updateMatrixWorld(true);
    updateTransform(transformGroup);
    mesh.removeInstances(instanceId);
  };

  return <instancedMesh2 args={args} onClick={onClick} />;
};

export default InstanceMesh;
