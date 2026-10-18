import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCallback, useEffect, type RefObject } from "react";
import { type Vector3Tuple } from "three";
import useCanvasStore from "../../stores/useCanvasStore";
import useControlStore from "../../stores/useControlStore";
import type { InstanceType } from "../../stores/type";

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
    (pos: Vector3Tuple | null) => {
      if (!Object.keys(addInstances).length) return;
      const mesh = ref.current;
      const data = addInstances?.[type];
      if (!data) return;
      if (!pos) return;
      const instanceCount = mesh.instancesCount;
      mesh.addInstances(data.length, (obj, index) => {
        const item = data[index - instanceCount];
        const newPos = item.position.map(
          (i, index) => pos[index] + i,
        ) as Vector3Tuple;
        obj.uuid = item.id;
        obj.position.set(...newPos);
        obj.scale.set(...item.scale);
        obj.quaternion.set(...item.quaternion);
      });
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
