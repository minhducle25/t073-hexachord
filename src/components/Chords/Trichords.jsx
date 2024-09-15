import React, { useRef, useState } from 'react';
import { categorizedPositions } from '../NoteMap'; // Import categorizedPositions
import ToneGenerator from '../ToneGenerator'; // Import ToneGenerator
import Notes from './Notes'; // Import Notes component

const logicalToSvg = ({ x, y }) => {
  // Convert logical coordinates to SVG coordinates
  return { x: x, y: y };
};

// Helper function to calculate the average of an array of values
const average = (values) => {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

// Function to rotate coordinates around a center point and translate them
const rotateAndTranslateCoordinates = (coords, angle, center, translation) => {
  const radians = (Math.PI / 180) * angle;
  return coords.map(({ x, y }) => {
    const dx = x - center.x;
    const dy = y - center.y;
    const rotatedX = center.x + dx * Math.cos(radians) - dy * Math.sin(radians);
    const rotatedY = center.y + dx * Math.sin(radians) + dy * Math.cos(radians);
    return {
      x: rotatedX + translation.x,
      y: rotatedY + translation.y,
    };
  });
};

// Function to divide points by 2 and round x-coordinates to two decimal places
const dividePointsByTwo = (points) => {
  return points.map(({ x, y }) => ({
    x: Math.round((x / 2) * 100) / 100,
    y: y / 2,
  }));
};

// Function to find matching points in all arrays of categorizedPositions and return note values
const findMatchingPoints = (points, categorizedPositions, range = 1) => {
  const matchingPoints = [];
  for (const note in categorizedPositions) {
    const aArray = categorizedPositions[note];
    points.forEach(({ x, y }) => {
      const match = aArray.find(point => 
        Math.abs(point.x - x) <= range && Math.abs(point.y - y) <= range
      );
      if (match) {
        matchingPoints.push({ ...match, note });
      }
    });
  }
  return matchingPoints;
};

const Trichords = ({ shape = [], scale, tx, ty, setMatchingPoints, setActiveChord }) => {
  const toneGeneratorRef = useRef(null); // Ref for ToneGenerator
  const [activeTrichord, setActiveTrichord] = useState(null); // State for active trichord
  const [disableHover, setDisableHover] = useState(false); // State to disable hover effect

  const coords = shape.map(logicalToSvg);
  const center = {
    x: average(coords.map(({ x }) => x)),
    y: average(coords.map(({ y }) => y)),
  };
  const points = coords.map(({ x, y }) => ({ x, y }));

  // Calculate new coordinates for the rotated trichord
  const translation = { x: 30, y: 50 }; // Adjust translation as needed
  const newCoords = rotateAndTranslateCoordinates(coords, 180, center, translation);
  const newPoints = newCoords.map(({ x, y }) => `${x},${y}`).join(' ');

  const handleMouseDown = (pointsString, trichordId) => {
    // Convert points string back to array of objects
    const pointsArray = pointsString.split(' ').map(point => {
      const [x, y] = point.split(',').map(Number);
      return { x, y };
    });

    // Divide points by 2 and find matching points
    const dividedPoints = dividePointsByTwo(pointsArray);
    const matchingPoints = findMatchingPoints(dividedPoints, categorizedPositions);

    // Play the matching points as a chord
    handleChordClick(matchingPoints);

    // Set the active trichord and disable hover effect
    setActiveTrichord(trichordId);
    setDisableHover(true);

    // Set matching points state
    setMatchingPoints(matchingPoints);
    setActiveChord(trichordId); // Set active chord
  };

  const handleChordClick = (matchingPoints) => {
    if (toneGeneratorRef.current) {
      toneGeneratorRef.current.playChord(matchingPoints);
    }
  };

  const handleMouseUp = () => {
    // Reset the active trichord and re-enable hover effect
    setActiveTrichord(null);
    setDisableHover(false);
    setMatchingPoints([]); // Clear matching points
    setActiveChord(null); // Clear active chord
  };

  return (
    <>
      <g className="tonnetzTrichord group">
        <polygon
          className={`fill-transparent stroke-current text-black stroke-opacity-50 ${disableHover ? '' : 'group-hover:fill-red-500'} ${activeTrichord === 1 ? 'fill-yellow-500' : ''}`}
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          onMouseDown={(e) => handleMouseDown(e.target.getAttribute('points'), 1)}
          onMouseUp={handleMouseUp}
        />
      </g>
      <g className="tonnetzTrichord group">
        <polygon
          className={`fill-transparent stroke-current text-black stroke-opacity-50 ${disableHover ? '' : 'group-hover:fill-red-500'} ${activeTrichord === 2 ? 'fill-yellow-500' : ''}`}
          points={newPoints}
          onMouseDown={(e) => handleMouseDown(e.target.getAttribute('points'), 2)}
          onMouseUp={handleMouseUp}
        />
      </g>
      <ToneGenerator ref={toneGeneratorRef} /> {/* Add ToneGenerator component */}
    </>
  );
};

export default Trichords;