import InstanceMesh from "./InstanceMesh";
import { useCanvasContext } from "../hooks/useCanvasContext";
import { INSTANCE_TYPES } from "../constants/data";
import useShortCut from "../hooks/useShortCut";

const Models = () => {
  const { instancesRef } = useCanvasContext();
  useShortCut();
  return (
    <group ref={instancesRef} onClick={() => console.log(instancesRef)}>
      {INSTANCE_TYPES.map((instanceType, index) => (
        <InstanceMesh
          key={instanceType.type}
          type={instanceType.type}
          indexMesh={index}
        />
      ))}
    </group>
  );
};

export default Models;
