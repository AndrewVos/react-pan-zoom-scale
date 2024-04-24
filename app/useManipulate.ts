import { RefObject, useEffect, useRef } from "react";

const useManipulate = (): { elementRef: RefObject<HTMLDivElement> } => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const events: PointerEvent[] = [];

    let oldRotation = -1;
    let oldDistanceBetweenFingers = -1;
    let oldMiddleOfFingers: {
      x: number;
      y: number;
    } | null;

    const translation = {
      x: 0,
      y: 0,
      rotation: 0,
      zoom: 1,
    };

    const handlePointerDown = (event: PointerEvent) => {
      events.push(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = events.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );

      const calculatePan = () => {
        const newMiddleOfFingers = {
          x: (events[0].clientX + events[1].clientX) / 2,
          y: (events[0].clientY + events[1].clientY) / 2,
        };

        let x = 0;
        let y = 0;

        if (oldMiddleOfFingers) {
          x = newMiddleOfFingers.x - oldMiddleOfFingers.x;
          y = newMiddleOfFingers.y - oldMiddleOfFingers.y;
        }

        oldMiddleOfFingers = newMiddleOfFingers;

        return { x, y };
      };

      const calculateZoom = () => {
        const newDistanceBetweenFingers = Math.abs(
          events[0].clientX - events[1].clientX
        );

        let zoom = 0;

        if (
          oldDistanceBetweenFingers > 0 &&
          newDistanceBetweenFingers !== oldDistanceBetweenFingers
        ) {
          zoom =
            (newDistanceBetweenFingers - oldDistanceBetweenFingers) /
            oldDistanceBetweenFingers;
        }

        oldDistanceBetweenFingers = newDistanceBetweenFingers;

        return zoom;
      };

      const calculateRotate = () => {
        const angleInDegrees =
          (Math.atan2(
            events[1].clientY - events[0].clientY,
            events[1].clientX - events[0].clientX
          ) *
            180) /
            Math.PI +
          180;

        let newRotation = 0;
        if (oldRotation > 0 && angleInDegrees !== oldRotation) {
          newRotation = angleInDegrees - oldRotation;
        }

        oldRotation = angleInDegrees;

        return newRotation;
      };

      if (events.length === 2) {
        const pan = calculatePan();
        translation.x += pan.x;
        translation.y += pan.y;

        const zoom = calculateZoom();
        translation.zoom += zoom;
        const rotate = calculateRotate();
        translation.rotation += rotate;
      }

      element.style.transform = `rotate(${translation.rotation}deg) scale(${translation.zoom}) translate(${translation.x}px, ${translation.y}px)`;

      events[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.splice(index, 1);

      if (events.length < 2) {
        oldDistanceBetweenFingers = -1;
        oldRotation = -1;
        oldMiddleOfFingers = null;
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
  }, [elementRef]);

  return { elementRef };
};

export default useManipulate;
