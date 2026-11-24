import CanvasMain from "./canvas/CanvasMain";
import ListObject from "./components/object";
import TransformMenu from "./components/transform/TransformMenu";

const Editor = () => {
  return (
    <div className="relative">
      <CanvasMain />
      <ListObject />
      <TransformMenu />
    </div>
  );
};

export default Editor;
