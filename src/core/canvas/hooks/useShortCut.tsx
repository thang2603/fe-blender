import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { useCallback, useEffect, type RefObject } from "react";
import { pasteJsonFromClipboard } from "../utils/helper";
import type { NodeType } from "../../stores/type";
import { Euler } from "three";

const SHORT_CUT = {
  ADD: "V",
};
type ShortCutType = {
  ref: RefObject<InstancedMesh2>;
  type: string;
};
const _euler = new Euler();
const useShortCut = ({ ref, type }: ShortCutType) => {
  const onAdd = useCallback(async () => {
    const mesh = ref.current;
    const listObj: Record<string, NodeType[]> | null =
      await pasteJsonFromClipboard();
    if (!listObj) return;
    const data = listObj?.[type];
    if (!data) return;
    const instanceCount = mesh.instancesCount;
    mesh.addInstances(data.length, (obj, index) => {
      const item = data[index - instanceCount];
      obj.position.set(...item.position);
      obj.scale.set(...item.scale);
      _euler.set(...item.rotation);
      obj.quaternion.setFromEuler(_euler.clone());
    });
    mesh.computeBVH();
  }, [ref, type]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey;

      if (ctrlKey) {
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
