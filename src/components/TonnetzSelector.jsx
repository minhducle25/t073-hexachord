import React from 'react';

// Utility function to compare arrays
const arrayEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const TonnetzSelector = ({ value, onChange }) => {
  const tonnetze3 = [
    [1, 1, 10],
    [1, 2, 9],
    [1, 3, 8],
    [1, 4, 7],
    [1, 5, 6],
    [2, 2, 8],
    [2, 3, 7],
    [2, 4, 6],
    [2, 5, 5],
    [3, 4, 5],
    [3, 3, 6],
    [4, 4, 4],
  ];

  const firstRow = tonnetze3.slice(0, 6);
  const secondRow = tonnetze3.slice(6);

  return (
    <div className="flex flex-col items-center mt-2 w-full" style={{border: "none" }}>
      <div className="flex justify-center w-full mx-auto">
        {/* Existing div wrapping the two rows */}
        <div className="flex flex-col w-3/4">
          {/* First row of buttons including Dual button */}
          <div className="flex justify-center w-full">
            {firstRow.map((tonnetz, index) => (
              <button
                key={index}
                onClick={() => onChange({ intervals: tonnetz, type: value.type })}
                className={`border border-gray-800 m-1 transition duration-200 text-xs p-2 ${
                  arrayEquals(tonnetz, value.intervals) ? "bg-gray-800 text-white" : ""
                }`}
                style={{ width: "16%" }}
              >
                {tonnetz.join(", ")}
              </button>
            ))}
          </div>

          {/* Second row of buttons */}
          <div className="flex justify-center w-full">
            {secondRow.map((tonnetz, index) => (
              <button
                key={index}
                onClick={() => onChange({ intervals: tonnetz, type: value.type })}
                className={`border border-gray-800 m-1 transition duration-200 text-xs p-2 ${
                  arrayEquals(tonnetz, value.intervals) ? "bg-gray-800 text-white" : ""
                }`}
                style={{ width: "16%" }} // Ensure buttons have equal width
              >
                {tonnetz.join(", ")}
              </button>
            ))}
          </div>
        </div>

        {/* New sub-div container */}
        <div className="flex flex-col w-1/8">
          <button
            onClick={() =>
              onChange({
                intervals: value.intervals,
                type: value.type === "chicken" ? "tonnetz" : "chicken",
              })
            }
            className={`border border-gray-800 m-1 transition duration-200 text-xs p-2 ${
              value.type === "chicken" ? "bg-gray-800 text-white" : ""
            } w-20`} // Adjust width using Tailwind classes
            style={{ height: "4.7rem" }} // Adjust height using inline styles
          >
            Dual
          </button>
        </div>
      </div>
    </div>
  );
};

export default TonnetzSelector;