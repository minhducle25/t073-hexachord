// Dichords.jsx

import React, { useRef, useCallback } from 'react';
import ToneGenerator from '../ToneGenerator'; // Import ToneGenerator
import { debounce } from 'lodash';

const Dichords = ({ points, onSideClick }) => {
  const toneGeneratorRef = useRef(null); // Create a ref for ToneGenerator

  // Function to calculate the midpoint of a line segment
  const calculateMidpoint = (x1, y1, x2, y2) => {
    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
  };

  // Convert points string to array of objects
  const pointsArray = points.split(' ').map(point => {
    const [x, y] = point.split(',').map(Number);
    return { x, y };
  });

    // Debounced function to handle side click
    const handleSideClick = useCallback(
      debounce((index) => {
        const notes = onSideClick(index);
        if (toneGeneratorRef.current) {
          toneGeneratorRef.current.playChord(notes);
        }
      }, 300), // Adjust the debounce delay as needed
      []
    );

  // Generate paths and circles for each side of the polygon
  const sides = pointsArray.map((point, index) => {
    const nextPoint = pointsArray[(index + 1) % pointsArray.length];
    const midpoint = calculateMidpoint(point.x, point.y, nextPoint.x, nextPoint.y);

    return (
      <g key={index} onClick={() => handleSideClick(index)}>
        <path
          d={`M${point.x},${point.y} L${nextPoint.x},${nextPoint.y}`}
          className="stroke-transparent hover:stroke-violet-900"
          strokeWidth="5"
          cursor="pointer"
          style={{ zIndex: 10, pointerEvents: 'all' }}
        />
        <circle
          cx={midpoint.x}
          cy={midpoint.y}
          r="5"
          className="fill-black hover:fill-indigo-500"
          cursor="pointer"
          style={{ zIndex: 10, pointerEvents: 'all' }}
        />
      </g>
    );
  });

  return (
    <>
      {sides}
      <ToneGenerator ref={toneGeneratorRef} /> {/* Add ToneGenerator component */}
    </>
  );
};

export default Dichords;