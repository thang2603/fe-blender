import { OrbitControls, Stats } from "@react-three/drei";

import Models from "../models/Models";
import MouseTracker from "../controls/MouseTracker";
import Grid from "../controls/Grid";

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <OrbitControls />
      <axesHelper args={[40]} />
      <Stats />
      <Grid />
      <MouseTracker />
      {/* instance */}
      <Models />
    </>
  );
};

export default Scene;
