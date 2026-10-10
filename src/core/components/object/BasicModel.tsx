import { INIT_INSTANCE_NODE } from "../../canvas/constants/data";
import {
  copyJsonToClipboard,
  generateUniqueId,
} from "../../canvas/utils/helper";

const instanceTypes = [
  {
    type: "cube",
  },
  {
    type: "sphere",
  },
];

const BasicModel = () => {
  const handleCopy = async (type: string) => {
    const obj = {
      ...INIT_INSTANCE_NODE,
      id: generateUniqueId(),
      type,
    };
    await copyJsonToClipboard({
      [type]: [obj],
    });
  };

  return (
    <div>
      <p className="font-medium">BASIC MODEL</p>
      <div className="pb-2.5 border-b-2 grid-cols-2 grid gap-1">
        {instanceTypes?.map((item) => (
          <div
            key={item.type}
            className="p-2 border rounded cursor-copy"
            onClick={() => handleCopy(item.type)}
          >
            <p>{item.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicModel;
