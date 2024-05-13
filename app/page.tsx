'use client'
import { useState } from "react";
import Draggable from "./Draggable";

export default function Home() {
  const [pan, setPan] = useState(true);
  const [pinch, setPinch] = useState(true);
  const [rotate, setRotate] = useState(true);

  return (
    <main className="h-full overflow-hidden touch-none container mx-auto p-3 flex flex-col gap-3" >
      <h1 className="text-3xl font-bold text-gray-900">Two finger pan zoom and pinch in React</h1>
      <div className="text-lg text-red-700">
        This only works on touch devices.
      </div>
      <div className="flex flex-grow border items-center justify-center overflow-hidden p-3">
        <Draggable enablePan={pan} enablePinch={pinch} enableRotate={rotate} />
      </div>
      <div>
        <label>
          <span className="text-lg text-gray-700 font-bold">Pan</span>
          <input type="checkbox" className="mr-2" checked={pan} onChange={() => setPan(!pan)} />
        </label>
        <label>
          <span className="text-lg text-gray-700 font-bold">Pinch</span>
          <input type="checkbox" className="mr-2" checked={pinch} onChange={() => setPinch(!pinch)} />
        </label>
        <label>
          <span className="text-lg text-gray-700 font-bold">Rotate</span>
          <input type="checkbox" className="mr-2" checked={rotate} onChange={() => setRotate(!rotate)} />
        </label>
      </div>
    </main>
  );
}
