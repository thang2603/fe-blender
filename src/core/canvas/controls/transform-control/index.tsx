import useCanvasStore from "../../../stores/useCanvasStore";
import TransfromGroup from "./TransformGroup";

const TransformControl = () => {
  const isTransform = useCanvasStore((s) => s.isTransform);
  return isTransform && <TransfromGroup />;
};

export default TransformControl;
