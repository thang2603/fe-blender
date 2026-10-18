import type { NodeType } from "./type";

export const covertArrayInstance = (instances: NodeType[]) => {
  const result: Record<string, NodeType[]> = {};

  instances.forEach((item) => {
    const type = item.type;
    if (!result?.[type]) {
      result[type] = [];
    }
    result[type].push(item);
  });
  return result;
};
