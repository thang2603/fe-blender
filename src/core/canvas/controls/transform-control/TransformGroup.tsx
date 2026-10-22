import { TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Vector3 } from "three";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { INSTANCE_TYPES } from "../../constants/data";
import useCanvasStore from "../../../stores/useCanvasStore";
import { type TransformMode, type NodeType } from "../../../stores/type";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransfromGroup = () => {
  const groupRef = useRef<Group>(null!);
  const [mode, setMode] = useState<TransformMode>("translate");
  const selected = useCanvasStore((state) => state.selected);
  const instancesSelected = useMemo(() => {
    const res: Record<string, NodeType[]> = {};
    const center = new Vector3(0, 0, 0);
    if (!selected || selected.size === 0) {
      return {
        center,
        data: res,
      };
    }
    for (const [, value] of selected) {
      const type = value.type;
      if (!res?.[type]) {
        res[type] = [];
      }
      res[type].push(value);
      center.add(value.position.clone());
    }
    center.divideScalar(selected.size);
    return {
      center,
      data: res,
    };
  }, [selected]);

  useEffect(() => {
    const handleKeyDonw = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      switch (key) {
        case KEY_MODE.POSITION:
          setMode("translate");
          break;
        case KEY_MODE.ROTATION:
          setMode("rotate");
          break;
        case KEY_MODE.SCALE:
          setMode("scale");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDonw);
    return () => {
      window.removeEventListener("keydown", handleKeyDonw);
    };
  }, []);

  return (
    <TransformControls object={groupRef} mode={mode} enabled={!!selected.size}>
      <group ref={groupRef} position={instancesSelected.center}>
        {INSTANCE_TYPES.map(({ type }) => (
          <InstaneMeshTransform
            type={type}
            key={`${type}_tranfrom`}
            instances={instancesSelected?.data?.[type]}
            center={instancesSelected.center}
          />
        ))}
      </group>
    </TransformControls>
  );
};

export default TransfromGroup;
