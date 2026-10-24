import useControlStore from "../../stores/useControlStore";

const MouseTracker = () => {
  const mousePosition = useControlStore((state) => state.mousePosition);

  return (
    mousePosition && (
      <mesh
        scale={[0.01, 0.01, 0.01]}
        position={mousePosition} // Đặt thấp hơn grid một chút để tránh xung đột z-index
      >
        <sphereGeometry args={[0.6, 32, 64]} />
        <meshBasicMaterial color={"red"} />
      </mesh>
    )
  );
};

export default MouseTracker;
