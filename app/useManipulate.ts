import { RefObject, useEffect, useRef, useState } from "react";

const usePan = ({
  element,
  enabled = true,
  onPan,
}: {
  element: HTMLDivElement | null;
  enabled?: boolean;
  onPan: (x: number, y: number) => void;
}) => {
  const events = useRef<PointerEvent[]>([]);

  const oldMiddleOfFingers = useRef<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!element) return;

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

      if (events.current.length === 2) {
        if (enabled) {
          const pan = calculatePan();
          onPan(pan.x, pan.y);
        }
      }

      events.current[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.current.splice(index, 1);

      if (events.current.length < 2) {
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
  }, [element, enabled, onPan]);
};

const usePinch = ({
  element,
  enabled = true,
  onPinch,
}: {
  element: HTMLDivElement | null;
  enabled?: boolean;
  onPinch: (scale: number) => void;
}) => {
  const events = useRef<PointerEvent[]>([]);
  const oldDistanceBetweenFingers = useRef(-1);

  useEffect(() => {
    if (!element) return;

    const handlePointerDown = (event: PointerEvent) => {
      events.current.push(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );

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
      if (events.current.length === 2) {
        if (enabled) {
          const zoom = calculateZoom();
          onPinch(zoom);
        }
      }

      events.current[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.current.splice(index, 1);

      if (events.current.length < 2) {
        oldDistanceBetweenFingers.current = -1;
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
  }, [element, enabled, onPinch]);
};

const useRotate = ({
  element,
  enabled = true,
  onRotate,
}: {
  element: HTMLDivElement | null;
  enabled?: boolean;
  onRotate: (degrees: number) => void;
}) => {
  const events = useRef<PointerEvent[]>([]);
  const oldRotation = useRef(-1);

  useEffect(() => {
    if (!element) return;

    const handlePointerDown = (event: PointerEvent) => {
      events.current.push(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );

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
        if (enabled) {
          onRotate(calculateRotate());
        }
      }

      events.current[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.current.splice(index, 1);

      if (events.current.length < 2) {
        oldRotation.current = -1;
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
  }, [element, enabled, onRotate]);
};

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
  const elementRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const translation = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    zoom: 1,
  });

  const applyTransform = () => {
    element!.style.transform = `scale(${translation.current.zoom}) translate(${translation.current.x}px, ${translation.current.y}px) rotate(${translation.current.rotation}deg) `;
  };

  usePan({
    element,
    enabled: enablePan,
    onPan: (x, y) => {
      translation.current.x += x;
      translation.current.y += y;
      applyTransform();
    },
  });

  usePinch({
    element,
    enabled: enablePinch,
    onPinch: (scale) => {
      translation.current.zoom = Math.max(
        minZoom,
        translation.current.zoom + scale
      );
      applyTransform();
    },
  });

  useRotate({
    element,
    enabled: enableRotate,
    onRotate: (degrees) => {
      translation.current.rotation += degrees;
      applyTransform();
    },
  });

  useEffect(() => {
    setElement(elementRef.current);
  }, [elementRef]);

  return { elementRef };
};

export default useManipulate;
