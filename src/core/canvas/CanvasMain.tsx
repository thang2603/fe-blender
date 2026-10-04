import { OrbitControls, Sky, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Models from "./models/Models";
import useCanvasShortcuts from "./hooks/useCanvasShortcuts";

const CanvasMain = () => {
  useCanvasShortcuts(); // Sử dụng hook để lắng nghe phím tắt
  return (
    <div className="w-screen h-screen">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
        <Sky />
        <OrbitControls />
        <Stats />
        <Models />
      </Canvas>
    </div>
  );
};

export default CanvasMain;
