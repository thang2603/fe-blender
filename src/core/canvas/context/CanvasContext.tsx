import {
  createContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Object3D, Vector3 } from "three";
import { INIT_POSITION, INSTANCE_TYPES } from "../constants/data";
import type { Mesh2 } from "../../stores/type";

type CanvasContextType = {
  instancesRef: RefObject<Array<Mesh2>>;
  mousePositionRef: RefObject<Vector3>;
  pivotRef: RefObject<Object3D>;
  selectedIdsRef: RefObject<Set<number>[]>;
};

type CanvasProviderType = {
  children: ReactNode;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: CanvasProviderType) => {
  const pivotRef = useRef<Object3D>(null!);
  const instancesRef = useRef<Array<Mesh2>>([]);
  const mousePositionRef = useRef<Vector3>(INIT_POSITION.clone());
  const selectedIdsRef = useRef<Set<number>[]>(
    INSTANCE_TYPES.map(() => new Set<number>()),
  );
  const value = useMemo(
    () => ({
      instancesRef,
      mousePositionRef,
      pivotRef,
      selectedIdsRef,
    }),
    [],
  );
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export default CanvasContext;
