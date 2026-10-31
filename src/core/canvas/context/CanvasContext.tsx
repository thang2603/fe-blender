import {
  createContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Group, Vector3 } from "three";
import { INIT_POSITION } from "../constants/data";

type CanvasContextType = {
  transformRef: RefObject<Group>;
  instancesRef: RefObject<Group>;
  mousePositionRef: RefObject<Vector3>;
};

type CanvasProviderType = {
  children: ReactNode;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: CanvasProviderType) => {
  const transformRef = useRef<Group>(null!);
  const instancesRef = useRef<Group>(null!);
  const mousePositionRef = useRef<Vector3>(INIT_POSITION.clone());
  const value = useMemo(
    () => ({
      transformRef,
      instancesRef,
      mousePositionRef,
    }),
    [],
  );
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export default CanvasContext;
