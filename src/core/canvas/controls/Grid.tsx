import { Grid as GridDrei } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useCanvasContext } from "../hooks/useCanvasContext";

const Grid = () => {
  const { mousePositionRef } = useCanvasContext();

  const onPointerMove = (e: ThreeEvent<MouseEvent>) => {
    const point = e.point.clone();
    mousePositionRef.current = point;
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
        onPointerMove={(e) => onPointerMove(e)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

export default Grid;
