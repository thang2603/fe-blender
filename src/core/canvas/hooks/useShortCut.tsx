import { useEffect, useMemo } from "react";

import { useCanvasContext } from "./useCanvasContext";
import { INSTANCE_TYPES } from "../constants/data";
import {
  addInstances,
  deselectAll,
  selectAll,
} from "../utils/instanceSelection";

const SHORT_CUT = {
  ADD: "V",
  SELECT_ALL: "A",
  DESELECT_ALL: "ESCAPE",
};

const useShortCut = () => {
  const { instancesRef, transformRef, mousePositionRef } = useCanvasContext();

  const indexByType = useMemo(() => {
    const res = new Map<number, string>();
    INSTANCE_TYPES.forEach((item, index) => {
      res.set(index, item.type);
    });
    return res;
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey;
      const instancesGroup = instancesRef.current;
      const transformGroup = transformRef.current;
      if (ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        switch (key) {
          case SHORT_CUT.ADD:
            addInstances(instancesGroup, mousePositionRef.current, indexByType);
            break;
          case SHORT_CUT.SELECT_ALL:
            selectAll(transformGroup, instancesGroup);
            break;

          default:
            break;
        }
      } else {
        switch (key) {
          case SHORT_CUT.DESELECT_ALL:
            deselectAll(transformGroup, instancesGroup);
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
  }, [mousePositionRef, indexByType, transformRef, instancesRef]);

  return null;
};

export default useShortCut;
