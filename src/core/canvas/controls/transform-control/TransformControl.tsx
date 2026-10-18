import { TransformControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Group } from "three";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { INSTANCE_TYPES } from "../../constants/data";
import useCanvasStore from "../../../stores/useCanvasStore";
import type { NodeType } from "../../../stores/type";

const TransformControl = () => {
  const groupRef = useRef<Group>(null!);
  const isTransform = useCanvasStore((state) => state.isTransform);
  const selected = useCanvasStore((state) => state.selected);
  const instancesSelected = useMemo(() => {
    const res: Record<string, NodeType[]> = {};
    for (const [_, value] of selected) {
      const type = value.type;
      if (!res?.[type]) {
        res[type] = [];
      }
      res[type].push(value);
    }
    return res;
  }, [selected]);

  return (
    isTransform && (
      <TransformControls
        object={groupRef}
        mode={"translate"}
        enabled={!!isTransform}
      >
        <group ref={groupRef}>
          {INSTANCE_TYPES.map(({ type }) => (
            <InstaneMeshTransform
              type={type}
              key={`${type}_tranfrom`}
              instances={instancesSelected?.[type]}
            />
          ))}
        </group>
      </TransformControls>
    )
  );
};

export default TransformControl;
