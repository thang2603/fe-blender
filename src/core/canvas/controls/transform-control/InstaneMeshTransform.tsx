import { useGLTF } from "@react-three/drei";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useEffect, useMemo, useRef } from "react";
import type { BufferGeometry, Material, Vector3 } from "three";
import type { InstanceType, NodeType } from "../../../stores/type";

type InstaneMeshTransformProps = {
  type: string;
  instances: NodeType[];
  center: Vector3;
};
const count = 10;
const InstaneMeshTransform = ({
  type,
  instances = [],
  center,
}: InstaneMeshTransformProps) => {
  const { meshes, materials } = useGLTF(`/models/${type}.glb`);
  const ref = useRef<InstancedMesh2<InstanceType>>(null!);

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

  useEffect(() => {
    const mesh = ref.current;
    mesh.clearInstances();
    (mesh.material as Material).transparent = true;
    mesh.addInstances(instances.length, (obj, index) => {
      const item = instances[index];
      const newPos = item.position.clone().sub(center);
      obj.uuid = item.id;
      obj.position.set(...newPos.toArray());
      obj.scale.set(...item.scale.clone().toArray());
      obj.quaternion.set(...item.quaternion.clone().toArray());
      obj.opacity = 0.3;
    });

    mesh.computeBVH();
    return () => {
      mesh.dispose();
    };
  }, [instances, center]);

  return <instancedMesh2 args={args} ref={ref} />;
};

export default InstaneMeshTransform;
