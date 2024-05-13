import { RefObject, useEffect, useRef, useState } from "react";

const useGesture = ({
  element,
  onBegin,
  onUpdate,
  onEnd,
}: {
  element: HTMLDivElement | null;
  onBegin?: () => void;
  onUpdate?: (event1: PointerEvent, event2: PointerEvent) => void;
  onEnd?: () => void;
}) => {
  const events = useRef<PointerEvent[]>([]);

  useEffect(() => {
    if (!element) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      events.current.push(event);
      if (events.current.length === 2 && onBegin) {
        onBegin();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );

      if (events.current.length === 2 && onUpdate) {
        onUpdate(events.current[0], events.current[1]);
      }

      events.current[index] = event;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const index = events.current.findIndex(
        (cachedEvent) => cachedEvent.pointerId === event.pointerId
      );
      events.current.splice(index, 1);

      if (onEnd) {
        onEnd();
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
  }, [element, onBegin, onUpdate, onEnd]);
};

const usePan = ({
  element,
  enabled = true,
  onPan,
}: {
  element: HTMLDivElement | null;
  enabled?: boolean;
  onPan: (x: number, y: number) => void;
}) => {
  const previousMiddle = useRef<{
    x: number;
    y: number;
  } | null>(null);

  useGesture({
    element,
    onUpdate: (event1, event2) => {
      if (enabled) {
        const middle = {
          x: (event1.clientX + event2.clientX) / 2,
          y: (event1.clientY + event2.clientY) / 2,
        };

        let x = 0;
        let y = 0;

        if (previousMiddle.current) {
          x = middle.x - previousMiddle.current.x;
          y = middle.y - previousMiddle.current.y;
        }

        previousMiddle.current = middle;

        onPan(x, y);
      }
    },
    onEnd: () => {
      previousMiddle.current = null;
    },
  });
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
  const previousDistance = useRef(-1);

  useGesture({
    element,
    onUpdate: (event1, event2) => {
      if (enabled) {
        const distance = Math.abs(event1.clientX - event2.clientX);

        let scale = 0;

        if (
          previousDistance.current > 0 &&
          distance !== previousDistance.current
        ) {
          scale =
            (distance - previousDistance.current) / previousDistance.current;
        }

        previousDistance.current = distance;

        onPinch(scale);
      }
    },
    onEnd: () => {
      previousDistance.current = -1;
    },
  });
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
  const previousRotation = useRef(-1);

  useGesture({
    element,
    onUpdate: (event1, event2) => {
      if (enabled) {
        const angleInDegrees =
          (Math.atan2(
            event2.clientY - event1.clientY,
            event2.clientX - event1.clientX
          ) *
            180) /
            Math.PI +
          180;

        let rotation = 0;
        if (
          previousRotation.current > 0 &&
          angleInDegrees !== previousRotation.current
        ) {
          rotation = angleInDegrees - previousRotation.current;
        }

        previousRotation.current = angleInDegrees;

        onRotate(rotation);
      }
    },
    onEnd: () => {
      previousRotation.current = -1;
    },
  });
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
