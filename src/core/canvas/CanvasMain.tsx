import { Canvas } from "@react-three/fiber";
import Scene from "./scene";
import { CanvasProvider } from "./context/CanvasContext";

const CanvasMain = () => {
  return (
    <CanvasProvider>
      <div className="w-screen h-screen bg-gray-800">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene />
        </Canvas>
      </div>
    </CanvasProvider>
  );
};

export default CanvasMain;
