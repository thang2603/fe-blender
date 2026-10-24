import {
  createContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Group } from "three";

type CanvasContextType = {
  transformRef: RefObject<Group>;
  instancesRef: RefObject<Group>;
};

type CanvasProviderType = {
  children: ReactNode;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: CanvasProviderType) => {
  const transformRef = useRef<Group>(null!);
  const instancesRef = useRef<Group>(null!);
  const value = useMemo(
    () => ({
      transformRef,
      instancesRef,
    }),
    [],
  );
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export default CanvasContext;
