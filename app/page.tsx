import Draggable from "./Draggable";

export default function Home() {

  return (
    <main className="h-full overflow-hidden touch-none container mx-auto p-3 flex flex-col gap-3" >
      <h1 className="text-3xl font-bold text-gray-900">React two finger pan zoom and pinch</h1>
      <div className="text-lg text-red-700">
        This only works on touch devices.
      </div>
      <div className="flex flex-grow border items-center justify-center overflow-hidden p-3">
        <Draggable />
      </div>
    </main>
  );
}
