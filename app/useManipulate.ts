import { RefObject, useEffect, useMemo, useRef } from "react";

const useManipulate = ({
  minZoom = 1,
  enablePan = true,
  enablePinch = true,
  enableRotate = true,
}: {
  minZoom?: number;
  enablePan?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
}): { elementRef: RefObject<HTMLDivElement> } => {
  const options = useMemo(
    () => ({
      enablePan,
      enablePinch,
      enableRotate,
    }),
    [enablePan, enablePinch, enableRotate]
  );
  const elementRef = useRef<HTMLDivElement>(null);
  const events = useRef<PointerEvent[]>([]);

  const oldRotation = useRef(-1);
  const oldDistanceBetweenFingers = useRef(-1);
  const oldMiddleOfFingers = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const translation = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    zoom: 1,
  });

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const handlePointerDown = (event: PointerEvent) => {
      events.current.push(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );

      const calculatePan = () => {
        const newMiddleOfFingers = {
          x: (events.current[0].clientX + events.current[1].clientX) / 2,
          y: (events.current[0].clientY + events.current[1].clientY) / 2,
        };

        let x = 0;
        let y = 0;

        if (oldMiddleOfFingers.current) {
          x = newMiddleOfFingers.x - oldMiddleOfFingers.current.x;
          y = newMiddleOfFingers.y - oldMiddleOfFingers.current.y;
        }

        oldMiddleOfFingers.current = newMiddleOfFingers;

        return { x, y };
      };

      const calculateZoom = () => {
        const newDistanceBetweenFingers = Math.abs(
          events.current[0].clientX - events.current[1].clientX
        );

        let zoom = 0;

        if (
          oldDistanceBetweenFingers.current > 0 &&
          newDistanceBetweenFingers !== oldDistanceBetweenFingers.current
        ) {
          zoom =
            (newDistanceBetweenFingers - oldDistanceBetweenFingers.current) /
            oldDistanceBetweenFingers.current;
        }

        oldDistanceBetweenFingers.current = newDistanceBetweenFingers;

        return zoom;
      };

      const calculateRotate = () => {
        const angleInDegrees =
          (Math.atan2(
            events.current[1].clientY - events.current[0].clientY,
            events.current[1].clientX - events.current[0].clientX
          ) *
            180) /
            Math.PI +
          180;

        let newRotation = 0;
        if (oldRotation.current > 0 && angleInDegrees !== oldRotation.current) {
          newRotation = angleInDegrees - oldRotation.current;
        }

        oldRotation.current = angleInDegrees;

        return newRotation;
      };

      if (events.current.length === 2) {
        if (options.enablePan) {
          const pan = calculatePan();
          translation.current.x += pan.x;
          translation.current.y += pan.y;
        }

        if (options.enablePinch) {
          const zoom = calculateZoom();
          translation.current.zoom += zoom;
        }

        if (options.enableRotate) {
          const rotate = calculateRotate();
          translation.current.rotation += rotate;
        }
      }

      element.style.transform = `rotate(${translation.current.rotation}deg) scale(${translation.current.zoom}) translate(${translation.current.x}px, ${translation.current.y}px)`;

      events.current[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.current.splice(index, 1);

      if (events.current.length < 2) {
        oldDistanceBetweenFingers.current = -1;
        oldRotation.current = -1;
        oldMiddleOfFingers.current = null;
      }
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
    };
  }, [elementRef, options]);

  return { elementRef };
};

export default useManipulate;
