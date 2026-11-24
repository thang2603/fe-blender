import { OrbitControls } from "@react-three/drei";
import Grid from "../controls/Grid";
import ModelContainer from "../models";
import { Perf } from "r3f-perf";
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <OrbitControls makeDefault />
      <axesHelper args={[40]} />
      <Perf position="top-left" />
      <Grid />
      <ModelContainer />
    </>
  );
};

export default Scene;
