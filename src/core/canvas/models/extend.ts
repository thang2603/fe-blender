import { extend, type ThreeElement } from "@react-three/fiber";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";

extend({ InstancedMesh2 });

declare module "@react-three/fiber" {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}
