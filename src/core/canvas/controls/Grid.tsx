import { Grid as GridDrei } from "@react-three/drei";
import useControlStore from "../../stores/useControlStore";
import type { ThreeEvent } from "@react-three/fiber";

const Grid = () => {
  const setMousePosition = useControlStore((state) => state.setMousePosition);
  const onDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const point = e.point.clone();
    setMousePosition(point);
  };

  return (
    <>
      <GridDrei
        position={[0, -0.01, 0]}
        args={[50, 50]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#cccccc"
        fadeDistance={30}
        fadeStrength={1}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]} // Đặt thấp hơn grid một chút để tránh xung đột z-index
        onClick={(e) => onDoubleClick(e)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

export default Grid;
