import InstanceMesh from "./InstanceMesh";
import { INSTANCE_TYPES } from "../constants/data";
import useShortCut from "../hooks/useShortCut";

const Models = () => {
  useShortCut();
  return INSTANCE_TYPES.map((instanceType, index) => (
    <InstanceMesh
      key={instanceType.type}
      type={instanceType.type}
      indexMesh={index}
    />
  ));
};

export default Models;
