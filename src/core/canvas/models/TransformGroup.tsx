import { TransformControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { TransformMode } from "../../stores/type";
import { INSTANCE_TYPES } from "../constants/data";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransformGroup = () => {
  const { transformRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");
  // const center = useCanvasStore((state) => state.center);

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
    <TransformControls object={transformRef} mode={mode}>
      <group ref={transformRef}>
        {INSTANCE_TYPES.map((item, index) => (
          <InstaneMeshTransform
            type={item.type}
            key={`${item.type}_tranfrom`}
            indexMesh={index}
          />
        ))}
      </group>
    </TransformControls>
  );
};

export default TransformGroup;
