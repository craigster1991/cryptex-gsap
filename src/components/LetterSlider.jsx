import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useLetters } from "../contexts/LetterContext";
import { useIsMobile } from "../hooks/useIsMobile";
import "./LetterSlider.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

const LetterSlider = ({ wheelIndex = 0 }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const initialIndex = 0;
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const draggableInstance = useRef(null);
  const { updateLetter } = useLetters();
  const isMobile = useIsMobile();

  const tickSound = () => {
    const audio = new Audio(import.meta.env.BASE_URL + 'tick.mp3');
    audio.play();
    
    // haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  useEffect(() => {
    const slider = sliderRef.current;
    const container = containerRef.current;

    if (!slider || !container) return;

    const letterSize = slider.children[0]?.[isMobile ? 'offsetWidth' : 'offsetHeight'] || 60;
    const containerSize = isMobile ? container.offsetWidth : container.offsetHeight;
    const centerOffset = containerSize / 2 - letterSize / 2;
    const cycleSize = letters.length * letterSize;
    const axis = isMobile ? 'x' : 'y';

    // Start at middle copy + initial offset
    const middleCopyOffset = 2 * cycleSize;
    const initialPos = centerOffset - middleCopyOffset - (currentIndex * letterSize);

    // Reset both axes, then set the active one
    gsap.set(slider, {
      x: isMobile ? initialPos : 0,
      y: isMobile ? 0 : initialPos
    });

    // Set bounds to allow scrolling 2 full cycles in each direction
    const maxPos = initialPos + (2 * cycleSize);
    const minPos = initialPos - (2 * cycleSize);

    let lastIndex = currentIndex;

    const updateIndexFromPosition = (pos) => {
      const rawIndex = Math.round((centerOffset - pos) / letterSize);
      const wrappedIndex = ((rawIndex % letters.length) + letters.length) % letters.length;

      if (wrappedIndex !== lastIndex) {
        lastIndex = wrappedIndex;
        tickSound();
        setCurrentIndex(wrappedIndex);
        updateLetter(wheelIndex, letters[wrappedIndex]);
      }
    }

    const checkTeleport = (currentPos) => {
      const absoluteIndex = Math.round((centerOffset - currentPos) / letterSize);

      // Scrolled into copy 4
      if (absoluteIndex >= 104) {
        const newPos = currentPos + cycleSize;
        gsap.set(slider, {
          x: isMobile ? newPos : 0,
          y: isMobile ? 0 : newPos
        });
        if (draggableInstance.current) {
          draggableInstance.current.update();
          const bounds = isMobile
            ? { minX: newPos - (2 * cycleSize), maxX: newPos + (2 * cycleSize) }
            : { minY: newPos - (2 * cycleSize), maxY: newPos + (2 * cycleSize) };
          draggableInstance.current.applyBounds(bounds);
        }
        return newPos;
      }

      // Scrolled into copy 0
      if (absoluteIndex < 26) {
        const newPos = currentPos - cycleSize;
        gsap.set(slider, {
          x: isMobile ? newPos : 0,
          y: isMobile ? 0 : newPos
        });
        if (draggableInstance.current) {
          draggableInstance.current.update();
          const bounds = isMobile
            ? { minX: newPos - (2 * cycleSize), maxX: newPos + (2 * cycleSize) }
            : { minY: newPos - (2 * cycleSize), maxY: newPos + (2 * cycleSize) };
          draggableInstance.current.applyBounds(bounds);
        }
        return newPos;
      }

      return currentPos;
    }

    const bounds = isMobile
      ? { minX: minPos, maxX: maxPos }
      : { minY: minPos, maxY: maxPos };

    draggableInstance.current = Draggable.create(slider, {
      type: axis,
      bounds: bounds,
      dragResistance: 0.5,
      edgeResistance: 1,
      inertia: true,
      snap: {
        [axis]: function (endValue) {
          return Math.round(endValue / letterSize) * letterSize;
        }
      },
      maxDuration: 0.5,
      throwResistance: 5000,
      onDrag: function () {
        updateIndexFromPosition(this[axis]);
      },
      onDragEnd: function () {
        checkTeleport(this[axis]);
        updateIndexFromPosition(this[axis]);
      },
      onThrowUpdate: function () {
        checkTeleport(this[axis]);
        updateIndexFromPosition(this[axis]);
      },
      onThrowComplete: function () {
        updateIndexFromPosition(this[axis]);
      }
    })[0];

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [wheelIndex, updateLetter, isMobile]);

  // Render 5 copies for infinite scroll buffer
  const repeatedLetters = [
    ...letters,
    ...letters,
    ...letters,
    ...letters,
    ...letters
  ];

  return (
    <div className={`letter-slider-container ${isMobile ? "mobile" : ""}`} ref={containerRef}>
      <div className="letter-slider" ref={sliderRef}>
        {repeatedLetters.map((letter, index) => {
          const letterIndex = index % letters.length;
          return (
            <div
              key={index}
              className={`letter-item ${letterIndex === currentIndex ? "active" : ""}`}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <div className="gradient-cover"></div>
    </div>
  );
};

export default LetterSlider;
