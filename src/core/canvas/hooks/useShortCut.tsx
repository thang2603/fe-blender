import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCallback, useEffect, type RefObject } from "react";
import { Vector3 } from "three";
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
  const mousePosition = useControlStore((state) => state.mousePosition);
  const addInstances = useCanvasStore((state) => state.addInstances);
  const setIsTransform = useCanvasStore((state) => state.setIsTransform);

  const onAdd = useCallback(
    (pos: Vector3 | null) => {
      if (!Object.keys(addInstances).length) return;
      const mesh = ref.current;
      let data = addInstances?.[type];
      if (!data) return;
      if (!pos) return;
      const instanceCount = mesh.instancesCount;
      data = data.map((item) => ({ ...item, id: generateUniqueId() }));
      console.log(data);
      mesh.addInstances(data.length, (obj, index) => {
        const item = data[index - instanceCount];
        const newPos = pos.add(item.position.clone());
        obj.uuid = item.id;
        obj.position.set(...newPos.clone().toArray());
        obj.scale.set(...item.scale.clone().toArray());
        obj.quaternion.set(...item.quaternion.clone().toArray());
      });
      console.log(mesh);
      mesh.computeBVH();
    },
    [ref, type, addInstances],
  );

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey;
      event.preventDefault();
      event.stopPropagation();
      if (ctrlKey) {
        switch (key) {
          case SHORT_CUT.ADD:
            onAdd(mousePosition);
            break;
          case SHORT_CUT.TRANSFORM:
            setIsTransform("translate");
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
  }, [onAdd, setIsTransform, mousePosition]);

  return null;
};

export default useShortCut;
