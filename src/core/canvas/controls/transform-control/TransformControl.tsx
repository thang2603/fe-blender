import { TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { INSTANCE_TYPES } from "../../constants/data";
import useCanvasStore from "../../../stores/useCanvasStore";
import type { NodeType } from "../../../stores/type";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransformControl = () => {
  const groupRef = useRef<Group>(null!);
  const isTransform = useCanvasStore((state) => state.isTransform);
  const selected = useCanvasStore((state) => state.selected);
  const setIsTransform = useCanvasStore((state) => state.setIsTransform);
  const instancesSelected = useMemo(() => {
    const res: Record<string, NodeType[]> = {};
    const center = [];
    for (const [_, value] of selected) {
      const type = value.type;
      if (!res?.[type]) {
        res[type] = [];
      }
      res[type].push(value);
    }
    return res;
  }, [selected]);

  useEffect(() => {
    const handleKeyDonw = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      switch (key) {
        case KEY_MODE.POSITION:
          setIsTransform("translate");
          break;
        case KEY_MODE.ROTATION:
          setIsTransform("rotate");
          break;
        case KEY_MODE.SCALE:
          setIsTransform("scale");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDonw);
    return () => {
      window.removeEventListener("keydown", handleKeyDonw);
    };
  }, [setIsTransform]);

  return (
    isTransform && (
      <TransformControls
        object={groupRef}
        mode={isTransform}
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
