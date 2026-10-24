import useControlStore from "../../stores/useControlStore";
import TransformGroup from "../controls/transform-control/TransformGroup";
import Models from "./Models";

const ModelContainer = () => {
  const isTransform = useControlStore((state) => state.isTransform);
  return (
    <>
      <Models />
      {isTransform && <TransformGroup />}
    </>
  );
};

export default ModelContainer;
