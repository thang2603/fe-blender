import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Group } from "three";
import InstaneMeshTransform from "./InstaneMeshTransform";
import useCanvasStore from "../../../stores/useCanvasStore";
import { type TransformMode } from "../../../stores/type";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const TransfromGroup = () => {
  const groupRef = useRef<Group>(null!);
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
      object={groupRef}
      mode={mode}
      enabled={!!transformSelected}
    >
      <group ref={groupRef} position={center}>
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

export default TransfromGroup;
