import { useContext } from "react";
import CanvasContext from "../context/CanvasContext";

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);

  if (context === undefined) {
    throw new Error("useCanvasConext must be used within a CanvasProvider");
  }
  return context;
};
