import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useLetters } from "../contexts/LetterContext";
import "./LetterSlider.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

const LetterSlider = ({ wheelIndex = 0 }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const initialIndexRef = useRef(Math.round(Math.random() * letters.length));
  const initialIndex = initialIndexRef.current;
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

    const maxY = centerOffset;
    const minY = centerOffset - (letters.length - 1) * letterHeight;

    const initialY = centerOffset - initialIndex * letterHeight;
    gsap.set(slider, { y: initialY });

    let lastIndex = initialIndex;

    // Set initial letter in context
    updateLetter(wheelIndex, letters[initialIndex]);

    const updateIndexFromPosition = (y) => {
      const index = Math.round((centerOffset - y) / letterHeight);
      const clampedIndex = Math.max(0, Math.min(index, letters.length - 1));

      if (clampedIndex !== lastIndex) {
        lastIndex = clampedIndex;
        tickSound();
        setCurrentIndex(clampedIndex);
        updateLetter(wheelIndex, letters[clampedIndex]);
      }
    }

    draggableInstance.current = Draggable.create(slider, {
      type: "y",
      bounds: {
        minY: minY,
        maxY: maxY,
      },
      dragResistance: 0.5,
      edgeResistance: 0,
      inertia: true,
      onDragEnd: function () {
        updateIndexFromPosition(this.y)
      },
      onMove: function () {
        updateIndexFromPosition(this.y)
      },
      onThrowUpdate: function () {
        updateIndexFromPosition(this.y)
      }
    })[0];

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill();
      }
    };
  }, [wheelIndex, updateLetter]);

  return (
    <div className="letter-slider-container" ref={containerRef}>
      <div className="letter-slider" ref={sliderRef}>
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`letter-item ${index === currentIndex ? "active" : ""}`}
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="gradient-cover"></div>
    </div>
  );
};

export default LetterSlider;
