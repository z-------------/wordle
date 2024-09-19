import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Wordle from "./components/Wordle";
import { socket } from "./socket";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Wordle socket={socket} />
  </StrictMode>,
)
