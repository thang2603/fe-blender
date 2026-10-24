import { toast } from "sonner";
import {
  INIT_INSTANCE_NODE,
  INSTANCE_TYPES,
} from "../../canvas/constants/data";
import useCanvasStore from "../../stores/useCanvasStore";

const BasicModel = () => {
  const setAddInstances = useCanvasStore((state) => state.setAddInstances);

  const handleCopy = (type: string) => {
    const obj = {
      ...INIT_INSTANCE_NODE,
      id: "1",
      type,
    };
    setAddInstances({ [type]: [obj] });
    toast.success("Copy successfully", { duration: 500 });
  };

  return (
    <div>
      <p className="font-medium">BASIC MODEL</p>
      <div className="pb-2.5 border-b-2 grid-cols-2 grid gap-1">
        {INSTANCE_TYPES?.map((item) => (
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
