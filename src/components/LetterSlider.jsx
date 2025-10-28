import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useLetters } from "../contexts/LetterContext";
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

    const letterHeight = slider.children[0]?.offsetHeight || 60;
    const containerHeight = container.offsetHeight;
    const centerOffset = containerHeight / 2 - letterHeight / 2;
    const cycleHeight = letters.length * letterHeight;

    // Start at middle copy + initial random offset
    const middleCopyOffset = 2 * cycleHeight; // Start at 3rd copy (index 2)
    const initialY = centerOffset - middleCopyOffset - (initialIndex * letterHeight);
    gsap.set(slider, { y: initialY });

    // Set bounds to allow scrolling 2 full cycles in each direction
    const maxY = initialY + (2 * cycleHeight);
    const minY = initialY - (2 * cycleHeight);

    let lastIndex = initialIndex;


    const updateIndexFromPosition = (y) => {
      const rawIndex = Math.round((centerOffset - y) / letterHeight);
      const wrappedIndex = ((rawIndex % letters.length) + letters.length) % letters.length;

      if (wrappedIndex !== lastIndex) {
        lastIndex = wrappedIndex;
        tickSound();
        setCurrentIndex(wrappedIndex);
        updateLetter(wheelIndex, letters[wrappedIndex]);
      }
    }

    const checkTeleport = (currentY) => {
      // Calculate absolute index based on position
      const absoluteIndex = Math.round((centerOffset - currentY) / letterHeight);

      // We have 5 copies (indices 0-129):
      // Copy 0: 0-25, Copy 1: 26-51, Copy 2: 52-77, Copy 3: 78-103, Copy 4: 104-129
      // Stay within copies 1, 2, 3 (indices 26-103)

      // Scrolled down into copy 4
      if (absoluteIndex >= 104) {
        const newY = currentY + cycleHeight;
        gsap.set(slider, { y: newY });
        if (draggableInstance.current) {
          draggableInstance.current.update();
          draggableInstance.current.applyBounds({
            minY: newY - (2 * cycleHeight),
            maxY: newY + (2 * cycleHeight)
          });
        }
        return newY;
      }

      // Scrolled up into copy 0
      if (absoluteIndex < 26) {
        const newY = currentY - cycleHeight;
        gsap.set(slider, { y: newY });
        if (draggableInstance.current) {
          draggableInstance.current.update();
          draggableInstance.current.applyBounds({
            minY: newY - (2 * cycleHeight),
            maxY: newY + (2 * cycleHeight)
          });
        }
        return newY;
      }

      return currentY;
    }

    draggableInstance.current = Draggable.create(slider, {
      type: "y",
      bounds: {
        minY: minY,
        maxY: maxY
      },
      dragResistance: 0.5,
      edgeResistance: 1,
      inertia: true,
      snap: function (endValue) {
        return Math.round(endValue / letterHeight) * letterHeight;
      },
      maxDuration: 0.5,
      throwResistance: 5000,
      onDrag: function () {
        updateIndexFromPosition(this.y);
      },
      onDragEnd: function () {
        checkTeleport(this.y);
        updateIndexFromPosition(this.y);
      },
      onThrowUpdate: function () {
        checkTeleport(this.y);
        updateIndexFromPosition(this.y);
      }
    })[0];

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [wheelIndex, updateLetter]);

  // Render 5 copies for infinite scroll buffer
  const repeatedLetters = [
    ...letters,
    ...letters,
    ...letters,
    ...letters,
    ...letters
  ];

  return (
    <div className="letter-slider-container" ref={containerRef}>
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
