import React, { useState } from "react";
import DragZoomSvg from "./DragZoomCircle";
import BottomDrawer from "./BottomDrawer";



// Utility functions
const arrayEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const gcd = (a, b) => (!b ? a : gcd(b, a % b));

const noteNames = [
    "A",
    "A♯",
    "B",
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
];

const TonnetzView = ({
    initTonnetz = [3, 4, 5],
    initType = "tonnetz",
    notes = noteNames,
    trace = false,
}) => {
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

    const [graph, setGraph] = useState({
        intervals: tonnetze3.find((value) => arrayEquals(initTonnetz, value)),
        type: initType,
    });
    const [lock, setLock] = useState(true);

    const isConnected = graph.intervals.reduce(gcd, 12) === 1;

    return (
        <div className="flex flex-col items-center justify-center p-0 m-0">
            <div className="circleView flex justify-center items-center">
                <DragZoomSvg
                    height={600}
                    width={1000}
                    lock={lock}
                    graph={graph}
                    setGraph={setGraph}
                    tonnetze={tonnetze3}
                />
            </div>
            <p
                className={`text-center text-gray-400 italic mt-2.5 ${isConnected ? "hidden" : "visible"
                    }`}
            >
                Not connected
            </p>
        </div>
    );
};

export default TonnetzView;