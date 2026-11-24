import { Box, Flex, Text, TextField } from "@radix-ui/themes";
import useCanvasStore from "../../stores/useCanvasStore";

const TransformMenu = () => {
  const center = useCanvasStore((state) => state.center);
  return (
    <Box
      maxWidth="200px"
      className="absolute top-40 right-4 bg-white rounded p-2"
    >
      <Flex>
        <Text size={"2"} weight={"medium"}>
          Transform
        </Text>
      </Flex>
      <Flex className="flex-col gap-1">
        <Flex className="flex flex-col gap-0.5">
          <Text size={"1"}>Position</Text>
          <TextField.Root
            size="1"
            placeholder="X"
            type="number"
            value={center.x}
          />
          <TextField.Root
            size="1"
            placeholder="Y"
            type="number"
            value={center.y}
          />
          <TextField.Root
            size="1"
            placeholder="Z"
            type="number"
            value={center.z}
          />
        </Flex>
        <Flex className="flex flex-col gap-0.5">
          <Text size={"1"}>Rotation</Text>
          <TextField.Root size="1" placeholder="X" type="number" step={1} />
          <TextField.Root size="1" placeholder="Y" type="number" step={1} />
          <TextField.Root size="1" placeholder="Z" type="number" step={1} />
        </Flex>
        <Flex className="flex flex-col gap-0.5">
          <Text size={"1"}>Position</Text>
          <TextField.Root
            size="1"
            placeholder="X"
            type="number"
            step={0.1}
            min={0}
          />
          <TextField.Root
            size="1"
            placeholder="Y"
            type="number"
            step={0.1}
            min={0}
          />
          <TextField.Root
            size="1"
            placeholder="Z"
            type="number"
            step={0.1}
            min={0}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default TransformMenu;
