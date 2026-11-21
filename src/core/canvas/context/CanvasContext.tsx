import {
  createContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Object3D, Vector3 } from "three";
import { INIT_POSITION } from "../constants/data";
import type { Mesh2 } from "../../stores/type";

type CanvasContextType = {
  transformsRef: RefObject<Array<Mesh2>>;
  instancesRef: RefObject<Array<Mesh2>>;
  mousePositionRef: RefObject<Vector3>;
  pivotRef: RefObject<Object3D>;
};

type CanvasProviderType = {
  children: ReactNode;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: CanvasProviderType) => {
  const pivotRef = useRef<Object3D>(null!);
  const transformsRef = useRef<Array<Mesh2>>([]);
  const instancesRef = useRef<Array<Mesh2>>([]);
  const mousePositionRef = useRef<Vector3>(INIT_POSITION.clone());
  const value = useMemo(
    () => ({
      transformsRef,
      instancesRef,
      mousePositionRef,
      pivotRef,
    }),
    [],
  );
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export default CanvasContext;
