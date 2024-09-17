import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Wordle from "./Wordle";
import { socket } from "./socket";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Wordle socket={socket} />
  </StrictMode>,
)
