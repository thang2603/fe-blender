import { TransformControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { type TransformMode } from "../../../stores/type";
import { useCanvasContext } from "../../hooks/useCanvasContext";
import { INSTANCE_TYPES } from "../../constants/data";
import useCanvasStore from "../../../stores/useCanvasStore";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransformGroup = () => {
  const { transformRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");
  const center = useCanvasStore((state) => state.center);

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
    <TransformControls
      object={transformRef}
      mode={mode}
      onMouseUp={() => console.log("up")}
      onClick={(e) => e.stopPropagation()}
    >
      <group ref={transformRef} position={center}>
        {INSTANCE_TYPES.map((item) => (
          <InstaneMeshTransform
            type={item.type}
            key={`${item.type}_tranfrom`}
          />
        ))}
      </group>
    </TransformControls>
  );
};

export default TransformGroup;
