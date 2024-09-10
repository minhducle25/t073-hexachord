import React from 'react';

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

const Trichords = ({ shape = [] }) => {
  const coords = shape.map(logicalToSvg);
  const center = {
    x: average(coords.map(({ x }) => x)),
    y: average(coords.map(({ y }) => y)),
  };
  const points = coords.map(({ x, y }) => `${x},${y}`).join(' ');

  // Calculate new coordinates for the rotated trichord
  const translation = { x: 30, y: 50 }; // Adjust translation as needed
  const newCoords = rotateAndTranslateCoordinates(coords, 180, center, translation);
  const newPoints = newCoords.map(({ x, y }) => `${x},${y}`).join(' ');

  const handleClick = (points) => {
    console.log('Polygon points:', points);
  };

  return (
    <>
      <g className="tonnetzTrichord group">
        <polygon
          className="fill-transparent stroke-current text-black stroke-opacity-50 group-hover:fill-red-500"
          points={points}
          onClick={() => handleClick(points)}
        />
      </g>
      <g className="tonnetzTrichord group">
        <polygon
          className="fill-transparent stroke-current text-black stroke-opacity-50 group-hover:fill-red-500"
          points={newPoints}
          onClick={() => handleClick(newPoints)}
        />
      </g>
    </>
  );
};

export default Trichords;