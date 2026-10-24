import InstanceMesh from "./InstanceMesh";
import { useCanvasContext } from "../hooks/useCanvasContext";
import { INSTANCE_TYPES } from "../constants/data";

const Models = () => {
  const { instancesRef } = useCanvasContext();

  return (
    <group ref={instancesRef} onClick={() => console.log(instancesRef)}>
      {INSTANCE_TYPES.map((instanceType) => (
        <InstanceMesh key={instanceType.type} type={instanceType.type} />
      ))}
    </group>
  );
};

export default Models;
