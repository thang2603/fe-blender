import type { NodeType } from "./type";
import { INIT_POSITION } from "../canvas/constants/data";

export const covertMapInstance = (selected: Map<string, NodeType>) => {
  const res: Record<string, NodeType[]> = {};
  const center = INIT_POSITION.clone();
  if (!selected || selected.size === 0) {
    return {
      center,
      data: res,
    };
  }
  for (const [, value] of selected) {
    const type = value.type;
    if (!res?.[type]) {
      res[type] = [];
    }
    res[type].push(value);
    center.add(value.position);
  }
  center.divideScalar(selected.size);
  return {
    center,
    data: res,
  };
};
