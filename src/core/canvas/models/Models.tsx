import InstanceMesh from "./InstanceMesh";

const instanceTypes = [
  {
    type: "cube",
  },
  {
    type: "sphere",
  },
];

const Models = () => {
  return instanceTypes.map((instanceType) => (
    <InstanceMesh key={instanceType.type} type={instanceType.type} />
  ));
};

export default Models;
