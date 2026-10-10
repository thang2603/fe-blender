import CanvasMain from "./canvas/CanvasMain";
import ListObject from "./components/object";

const Editor = () => {
  return (
    <div className="relative">
      <CanvasMain />
      <ListObject />
    </div>
  );
};

export default Editor;
