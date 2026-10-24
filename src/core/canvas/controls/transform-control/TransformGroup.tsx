import { TransformControls } from "@react-three/drei";
import { useEffect, useState } from "react";

import InstaneMeshTransform from "./InstaneMeshTransform";
import useCanvasStore from "../../../stores/useCanvasStore";
import { type TransformMode } from "../../../stores/type";
import { useCanvasContext } from "../../hooks/useCanvasContext";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransformGroup = () => {
  const { transformRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");

  const center = useCanvasStore((state) => state.center);
  const transformSelected = useCanvasStore((state) => state.transformSelected);

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
      enabled={!!transformSelected}
      onMouseUp={() => console.log("up")}
      onClick={(e) => e.stopPropagation()}
    >
      <group ref={transformRef} position={center}>
        {Object.entries(transformSelected).map(([type, instances]) => (
          <InstaneMeshTransform
            type={type}
            key={`${type}_tranfrom`}
            instances={instances}
            center={center}
          />
        ))}
      </group>
    </TransformControls>
  );
};

export default TransformGroup;
