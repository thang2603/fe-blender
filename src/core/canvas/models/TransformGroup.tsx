import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useCanvasContext } from "../hooks/useCanvasContext";
import type { TransformMode } from "../../stores/type";
import { INIT_POSITION, INIT_QUATERNION, INIT_SCALE } from "../constants/data";

const KEY_MODE = {
  POSITION: "Q",
  ROTATION: "W",
  SCALE: "E",
};
const MIN_SCALE = 1e-4;

type Start = {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scl: THREE.Vector3;
};

const TransformGroup = () => {
  const { transformsRef, pivotRef } = useCanvasContext();
  const [mode, setMode] = useState<TransformMode>("translate");

  const startPivotPos = useRef(INIT_POSITION.clone());
  const startPivotQuat = useRef(INIT_QUATERNION.clone());
  const startPivotScale = useRef(INIT_SCALE.clone());
  // starts.current[meshIndex][instanceIndex]
  const starts = useRef<Start[][]>([]);

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
      <TransformControls object={pivotRef} mode={mode} space="local" />
    </>
  );
};

export default TransformGroup;
