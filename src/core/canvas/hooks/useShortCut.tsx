import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCallback, useEffect, type RefObject } from "react";
import { Euler } from "three";
import useCanvasStore from "../../stores/useCanvasStore";
import useControlStore from "../../stores/useControlStore";
import type { VectorType } from "../../stores/type";

const SHORT_CUT = {
  ADD: "V",
};
type ShortCutType = {
  ref: RefObject<InstancedMesh2>;
  type: string;
};

const _euler = new Euler();
const useShortCut = ({ ref, type }: ShortCutType) => {
  const addInstances = useCanvasStore((state) => state.addInstances);
  const mousePosition = useControlStore((state) => state.mousePosition);

  const onAdd = useCallback(
    async (pos: VectorType | null) => {
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
        ) as VectorType;
        obj.position.set(...newPos);
        obj.scale.set(...item.scale);
        _euler.set(...item.rotation);
        obj.quaternion.setFromEuler(_euler.clone());
      });
      mesh.computeBVH();
    },
    [ref, type, addInstances],
  );

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey;

      if (ctrlKey) {
        switch (key) {
          case SHORT_CUT.ADD:
            onAdd(mousePosition);
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
  }, [onAdd, mousePosition]);
  return null;
};

export default useShortCut;
