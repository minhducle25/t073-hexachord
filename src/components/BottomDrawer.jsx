import React, { useState, useEffect } from "react";
import TonnetzSelector from "./TonnetzSelector";

const BottomDrawer = ({ graph, setGraph, x, y, isConnected }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log(`BottomDrawer is open at x: ${x + 50}, y: ${y}`);
    }
  }, [isOpen, x, y]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: "transparent",
        position: "absolute",
        left: x,
        top: y,
      }}
    >
      <div
        className="w-full mx-auto flex flex-col justify-center py-2 relative p-2"
        style={{ backgroundColor: "transparent" }}
      >
        <div
          className="border-t pt-2 w-full"
          style={{ backgroundColor: "transparent", border: "none" }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="rounded-full bg-orange-600 p-2 text-sm font-semibold text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center"
            style={{
              width: "2.5em",
              height: "2.5em",
              zIndex: 10,
              position: "relative",
            }}
          >
            <svg width="1em" height="1em" viewBox="0 0 256 256">
              <path
                fill="currentColor"
                d="M215.38 14.54a12 12 0 0 0-10.29-2.18l-128 32A12 12 0 0 0 68 56v103.35A40 40 0 1 0 92 196V65.37l104-26v88A40 40 0 1 0 220 164V24a12 12 0 0 0-4.62-9.46M52 212a16 16 0 1 1 16-16a16 16 0 0 1-16 16m128-32a16 16 0 1 1 16-16a16 16 0 0 1-16 16"
              />
            </svg>
          </button>
          <div
            className={`fixed inset-x-5 bottom-0 flex flex-col justify-center items-center gap-x-4 gap-y-2 p-2 md:flex-row md:items-center lg:p-4 ${
              isOpen ? "block" : "hidden"
            }`}
            style={{ backgroundColor: "transparent", border: "none" }}
          >
            <div
              className="flex flex-col lg:flex-row gap-2 justify-center items-center w-3/4"
              style={{ backgroundColor: "white", border: "none" }}
            >
              <TonnetzSelector value={graph} onChange={setGraph} />
            </div>
          </div>{" "}
        </div>
      </div>
    </section>
  );
};

export default BottomDrawer;
