import { OrbitControls, Stats } from "@react-three/drei";
import Models from "../models/Models";
import MouseTracker from "../controls/MouseTracker";
import Grid from "../controls/Grid";
import TransformControl from "../controls/transform-control/TransformControl";

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <OrbitControls makeDefault />
      <axesHelper args={[40]} />
      <Stats />
      <Grid />
      <MouseTracker />
      {/* instance */}
      <Models />
      {/* transform */}
      <TransformControl />
    </>
  );
};

export default Scene;
