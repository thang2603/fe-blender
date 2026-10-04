import { useEffect } from "react";
import useCanvasStore from "../../stores/useCanvasStore";
import { INIT_INSTANCE_NODE } from "../constants/data";

const useCanvasShortcuts = () => {
  const addInstances = useCanvasStore((s) => s.addInstances);
  const updateInstances = useCanvasStore((s) => s.updateInstances);
  const removeInstances = useCanvasStore((s) => s.removeInstances);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.ctrlKey && key === "a") {
        event.preventDefault();
        const instance = INIT_INSTANCE_NODE;
        addInstances([instance, instance, instance]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [addInstances, updateInstances, removeInstances]);
};

export default useCanvasShortcuts;
