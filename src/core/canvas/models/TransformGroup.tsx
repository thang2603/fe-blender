import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { TransformMode } from "../../stores/type";
import {
  INIT_POSITION,
  INIT_QUATERNION,
  INIT_SCALE,
  INSTANCE_TYPES,
} from "../constants/data";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};

const TransformGroup = () => {
  const { pivotRef, instancesRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");

  const startPivotPos = useRef(INIT_POSITION.clone());
  const startPivotQuat = useRef(INIT_QUATERNION.clone());
  const startPivotScale = useRef(INIT_SCALE.clone());

  const handleStart = () => {
    const pivot = pivotRef.current;
    startPivotPos.current.copy(pivot.position);
    startPivotQuat.current.copy(pivot.quaternion);
    startPivotScale.current.copy(pivot.scale);
  };

  const handleEnd = () => {
    const pivot = pivotRef.current;
    pivot.quaternion.copy(INIT_QUATERNION.clone());
    pivot.scale.copy(INIT_SCALE.clone());
  };

  const handleChange = () => {
    const pivot = pivotRef.current;
    // pos
    const position = pivot.position.clone().sub(startPivotPos.current);
    // qua
    const deltaRotation = pivot.quaternion
      .clone()
      .multiply(startPivotQuat.current.clone().invert());

    const instancesMeshes = instancesRef.current;
    const length = INSTANCE_TYPES.length;
    for (let i = 0; i < length; i++) {
      const mesh = instancesMeshes[i];
      mesh.updateInstances((obj) => {
        if (obj.active && obj.selected) {
          const _p = obj.position.clone();
          const _q = obj.quaternion.clone();
          const _s = obj.scale.clone();
          switch (mode) {
            case "translate":
              obj.position.copy(_p.add(position));
              break;
            case "rotate":
              {
                const offset = obj.position.clone().sub(pivot.position);
                offset.applyQuaternion(deltaRotation);
                obj.position.copy(pivot.position.clone()).add(offset);
                obj.quaternion.copy(deltaRotation.clone()).multiply(_q.clone());
              }
              break;
            default:
              break;
          }
        }
      });
    }
    handleStart();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case KEY_MODE.POSITION:
          setMode("translate");
          break;
        case KEY_MODE.ROTATION:
          setMode("rotate");
          break;
        case KEY_MODE.SCALE:
          setMode("scale");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <object3D ref={pivotRef} position={[0, 0, 0]} />
      <TransformControls
        object={pivotRef}
        mode={mode}
        onMouseDown={handleStart}
        onObjectChange={handleChange}
        onMouseUp={handleEnd}
      />
    </>
  );
};

export default TransformGroup;
