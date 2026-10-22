import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCallback, useEffect, type RefObject } from "react";
import useCanvasStore from "../../stores/useCanvasStore";
import useControlStore from "../../stores/useControlStore";
import type { InstanceType } from "../../stores/type";
import { generateUniqueId } from "../utils/helper";

const SHORT_CUT = {
  ADD: "V",
  TRANSFORM: "G",
};

type ShortCutType = {
  ref: RefObject<InstancedMesh2<InstanceType>>;
  type: string;
};

const useShortCut = ({ ref, type }: ShortCutType) => {
  const onAdd = useCallback(() => {
    const addInstances = useCanvasStore.getState().addInstances;
    const mousePosition = useControlStore.getState().mousePosition;
    if (!Object.keys(addInstances).length) return;
    const mesh = ref.current;
    let data = addInstances?.[type];
    if (!data) return;
    if (!mousePosition) return;
    const instanceCount = mesh.instancesCount;
    data = data.map((item) => ({ ...item, id: generateUniqueId() }));
    mesh.addInstances(data.length, (obj, index) => {
      const item = data[index - instanceCount];
      const newPos = mousePosition.clone().add(item.position);
      obj.uuid = item.id;
      obj.position.set(...newPos.clone().toArray());
      obj.scale.set(...item.scale.clone().toArray());
      obj.quaternion.set(...item.quaternion.clone().toArray());
    });
    mesh.computeBVH();
    return () => {
      mesh.dispose();
    };
  }, [ref, type]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey;
      if (ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        switch (key) {
          case SHORT_CUT.ADD:
            onAdd();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onAdd]);

  return null;
};

export default useShortCut;
