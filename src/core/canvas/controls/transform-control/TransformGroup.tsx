import { TransformControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import InstaneMeshTransform from "./InstaneMeshTransform";
import { type InstanceType, type TransformMode } from "../../../stores/type";
import { useCanvasContext } from "../../hooks/useCanvasContext";
import { INSTANCE_TYPES } from "../../constants/data";
import useCanvasStore from "../../../stores/useCanvasStore";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";

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

  useEffect(() => {
    const length = transformRef.current.children.length;
    for (let i = 0; i < length; i++) {
      const tempMesh = transformRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;
      const lengthInstances = tempMesh?.instances?.length;
      if (lengthInstances > 0) {
        tempMesh.updateInstances((obj) => {
          const newPos = obj.oldPosition.clone().sub(center);
          obj.position.set(...newPos.toArray());
        });
      }
    }
  }, [center, transformRef]);
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
            center={center}
          />
        ))}
      </group>
    </TransformControls>
  );
};

export default TransformGroup;
