import { useCallback, useRef, useState } from "react";
import { animate, type JSAnimation } from "animejs";

export interface DragState {
  isDragging: boolean;
  draggedCardId: string | null;
  draggedElement: HTMLElement | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

export interface DropZone {
  element: HTMLElement;
  zoneIndex: number;
  zoneType: "monster" | "spellTrap";
  isEmpty: boolean;
  bounds: DOMRect;
}

export interface UseDragAndDropOptions {
  onDrop: (
    cardId: string,
    zoneIndex: number,
    zoneType: "monster" | "spellTrap"
  ) => void;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: () => void;
  isDisabled?: boolean;
}

export const useDragAndDrop = (options: UseDragAndDropOptions) => {
  const { onDrop, onDragStart, onDragEnd, isDisabled = false } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCardId: null,
    draggedElement: null,
    startPosition: null,
    currentPosition: null,
  });

  const dropZonesRef = useRef<DropZone[]>([]);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<JSAnimation | null>(null);

  // Register a drop zone
  const registerDropZone = useCallback(
    (
      element: HTMLElement,
      zoneIndex: number,
      zoneType: "monster" | "spellTrap",
      isEmpty: boolean
    ) => {
      const existingIndex = dropZonesRef.current.findIndex(
        (zone) => zone.zoneIndex === zoneIndex && zone.zoneType === zoneType
      );

      const zone: DropZone = {
        element,
        zoneIndex,
        zoneType,
        isEmpty,
        bounds: element.getBoundingClientRect(),
      };

      if (existingIndex !== -1) {
        dropZonesRef.current[existingIndex] = zone;
      } else {
        dropZonesRef.current.push(zone);
      }
    },
    []
  );

  // Unregister a drop zone
  const unregisterDropZone = useCallback(
    (zoneIndex: number, zoneType: "monster" | "spellTrap") => {
      dropZonesRef.current = dropZonesRef.current.filter(
        (zone) => !(zone.zoneIndex === zoneIndex && zone.zoneType === zoneType)
      );
    },
    []
  );

  // Find nearest drop zone to a point
  const findNearestDropZone = useCallback(
    (x: number, y: number): DropZone | null => {
      let nearestZone: DropZone | null = null;
      let minDistance = Infinity;

      // Only consider empty zones for dropping
      const emptyZones = dropZonesRef.current.filter((zone) => zone.isEmpty);

      for (const zone of emptyZones) {
        const bounds = zone.bounds;
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );

        // Forgiving threshold - if the drop point is anywhere near the board area
        // we'll find the closest slot. Threshold of 300px means very forgiving.
        if (distance < 300 && distance < minDistance) {
          minDistance = distance;
          nearestZone = zone;
        }
      }

      return nearestZone;
    },
    []
  );

  // Create ghost element for dragging
  const createGhostElement = useCallback(
    (sourceElement: HTMLElement): HTMLElement => {
      const ghost = sourceElement.cloneNode(true) as HTMLElement;
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.opacity = "0.8";
      ghost.style.width = `${sourceElement.offsetWidth}px`;
      ghost.style.height = `${sourceElement.offsetHeight}px`;
      document.body.appendChild(ghost);

      // Initial scale up animation
      animate(ghost, {
        scale: [1, 1.1],
        duration: 200,
        easing: "out-quad",
      });

      return ghost;
    },
    []
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      cardId: string,
      element: HTMLElement
    ) => {
      if (isDisabled) return;

      // DEBUG: Log drag start
      console.log("🎯 Drag Start:", {
        cardId,
        element: element.className,
        eventType: event.type,
      });

      // Cancel any existing animations
      if (animationRef.current) {
        animationRef.current.pause();
      }

      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      // DEBUG: Check if any parent elements have transforms or are scrollable
      let parent = element.parentElement;
      let level = 0;
      while (parent && level < 5) {
        const styles = window.getComputedStyle(parent);
        console.log(`📦 Parent ${level} (${parent.className}):`, {
          overflow: styles.overflow,
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          transform: styles.transform,
          touchAction: styles.touchAction,
          position: styles.position,
        });
        parent = parent.parentElement;
        level++;
      }

      const ghost = createGhostElement(element);
      ghostElementRef.current = ghost;

      // Position ghost centered at cursor
      ghost.style.left = `${clientX - ghost.offsetWidth / 2}px`;
      ghost.style.top = `${clientY - ghost.offsetHeight / 2}px`;

      setDragState({
        isDragging: true,
        draggedCardId: cardId,
        draggedElement: element,
        startPosition: { x: clientX, y: clientY },
        currentPosition: { x: clientX, y: clientY },
      });

      // Hide original element
      element.style.opacity = "0.3";

      onDragStart?.(cardId);
    },
    [isDisabled, createGhostElement, onDragStart]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!dragState.isDragging || !ghostElementRef.current) return;

      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      // DEBUG: Check if any elements are moving unexpectedly
      const gameBoard = document.querySelector(".game-board-container");
      const handContainer = document.querySelector(".player-hand-container");

      if (gameBoard) {
        const rect = gameBoard.getBoundingClientRect();
        const styles = window.getComputedStyle(gameBoard);
        console.log("🎮 Game Board Position During Drag:", {
          top: rect.top,
          left: rect.left,
          transform: styles.transform,
          scrollTop: (gameBoard as HTMLElement).scrollTop,
          scrollLeft: (gameBoard as HTMLElement).scrollLeft,
        });
      }

      // Position ghost centered at cursor
      ghostElementRef.current.style.left = `${
        clientX - ghostElementRef.current.offsetWidth / 2
      }px`;
      ghostElementRef.current.style.top = `${
        clientY - ghostElementRef.current.offsetHeight / 2
      }px`;

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: clientX, y: clientY },
      }));

      // Highlight nearest drop zone
      const nearestZone = findNearestDropZone(clientX, clientY);
      dropZonesRef.current.forEach((zone) => {
        if (zone.element && zone.isEmpty) {
          if (zone === nearestZone) {
            zone.element.style.backgroundColor = "rgba(34, 197, 94, 0.3)";
            zone.element.style.transform = "scale(1.05)";
            zone.element.style.border = "2px solid rgb(34, 197, 94)";
          } else {
            zone.element.style.backgroundColor = "";
            zone.element.style.transform = "";
            zone.element.style.border = "";
          }
        }
      });
    },
    [dragState, findNearestDropZone]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (
      !dragState.isDragging ||
      !ghostElementRef.current ||
      !dragState.draggedElement
    )
      return;

    const ghost = ghostElementRef.current;
    const originalElement = dragState.draggedElement;
    const currentPos = dragState.currentPosition!;

    // Find nearest drop zone
    const nearestZone = findNearestDropZone(currentPos.x, currentPos.y);

    if (nearestZone) {
      // Valid drop - animate to slot
      const targetBounds = nearestZone.bounds;
      const targetX =
        targetBounds.left + targetBounds.width / 2 - ghost.offsetWidth / 2;
      const targetY =
        targetBounds.top + targetBounds.height / 2 - ghost.offsetHeight / 2;

      animationRef.current = animate(ghost, {
        left: `${targetX}px`,
        top: `${targetY}px`,
        scale: [1.1, 1.0],
        rotate: [5, 0],
        opacity: [0.8, 0],
        duration: 600,
        easing: "spring(1, 80, 10, 0)",
        onComplete: () => {
          ghost.remove();
          ghostElementRef.current = null;
          originalElement.style.opacity = "1";

          // Execute the drop action
          onDrop(
            dragState.draggedCardId!,
            nearestZone.zoneIndex,
            nearestZone.zoneType
          );
        },
      });
    } else {
      // Invalid drop - return to hand
      const startBounds = originalElement.getBoundingClientRect();

      animationRef.current = animate(ghost, {
        left: `${startBounds.left}px`,
        top: `${startBounds.top}px`,
        scale: [1.1, 1.0],
        rotate: [-10, 0],
        opacity: [0.8, 0],
        duration: 400,
        easing: "out-elastic(1, 0.6)",
        onComplete: () => {
          ghost.remove();
          ghostElementRef.current = null;
          originalElement.style.opacity = "1";
        },
      });
    }

    // Clear drop zone highlights
    dropZonesRef.current.forEach((zone) => {
      if (zone.element) {
        zone.element.style.backgroundColor = "";
        zone.element.style.transform = "";
        zone.element.style.border = "";
      }
    });

    setDragState({
      isDragging: false,
      draggedCardId: null,
      draggedElement: null,
      startPosition: null,
      currentPosition: null,
    });

    onDragEnd?.();
  }, [dragState, findNearestDropZone, onDrop, onDragEnd]);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    registerDropZone,
    unregisterDropZone,
  };
};
