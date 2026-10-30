import { useCallback, useEffect, useMemo } from "react";
import useCanvasStore from "../../stores/useCanvasStore";
import { generateUniqueId } from "../utils/helper";
import { useCanvasContext } from "./useCanvasContext";
import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { InstanceType } from "../../stores/type";
import { INSTANCE_TYPES } from "../constants/data";

const SHORT_CUT = {
  ADD: "V",
};

const useShortCut = () => {
  const { instancesRef, mousePositionRef } = useCanvasContext();

  const indexByType = useMemo(() => {
    const res = new Map<number, string>();
    INSTANCE_TYPES.forEach((item, index) => {
      res.set(index, item.type);
    });
    return res;
  }, []);

  const onAdd = useCallback(() => {
    if (!instancesRef.current) return;
    const addInstances = useCanvasStore.getState().addInstances;
    const mousePosition = mousePositionRef.current;
    if (!Object.keys(addInstances).length) return;
    if (!mousePosition) return;
    const length = instancesRef.current.children.length;
    for (let i = 0; i < length; i++) {
      const mesh = instancesRef.current.children[
        i
      ] as InstancedMesh2<InstanceType>;

      const type = indexByType.get(i);

      if (!type) continue;
      let data = addInstances?.[type];
      if (!data) continue;

      data = data.map((item) => ({ ...item, id: generateUniqueId() }));
      let index = 0;
      mesh.addInstances(data.length, (obj) => {
        const item = data[index];
        const newPos = mousePosition.clone().add(item.position);
        obj.uuid = item.id;
        obj.position.set(...newPos.clone().toArray());
        obj.scale.set(...item.scale.clone().toArray());
        obj.quaternion.set(...item.quaternion.clone().toArray());
        index++;
      });
      mesh.computeBVH();
    }
  }, [instancesRef, indexByType, mousePositionRef]);

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
