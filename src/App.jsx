import React, { useState, useRef, useEffect } from 'react';
import IntroJs from 'intro.js';
import 'intro.js/introjs.css';
import { FaInfoCircle } from 'react-icons/fa';
import CircleView from './components/Circles/CircleView';
import TonnetzView from './components/TonnetzGrid/TonnetzView';
import Sidebar from './components/sidebar/SideBar';
import { PlayingProvider } from './context/PlayingContext';
import Header from './components/Header/Header';

const App = () => {
    const [notes, setNotes] = useState([]);
    const tour = useRef(null);

    useEffect(() => {
        tour.current = IntroJs();

        // Define the steps for the tour
        tour.current.setOptions({
            steps: [
                {
                    element: '.tonnetzView',
                    intro: `
                    <strong>Interactive Tonnetz Grid</strong><br>
                    <em>What it does:</em> A visual grid that allows users to play and experiment with musical notes, showcasing harmonies and chord progressions in real-time.<br>
                    <em>How to use:</em> Click on the individual notes on the grid to hear them play. The grid will highlight the notes you select, showing how they harmonize with others.
                `,                    
                    position: 'right'
                },
                {
                    element: '.circleView',
                    intro: `
                    <strong>What it does:</strong> A visual tool that helps users understand and explore relationships between different musical keys and chords. It shows how keys are connected through perfect fifths, helping users build harmonies and progressions.<br>
                    <strong>How to use:</strong> Use the circle to select different keys or chords. Clicking on a key will highlight related chords, allowing you to experiment with chord progressions and key changes in your composition.
                    `,                    
                    position: 'left'
                },
                {
                    element: '.loopPlayer',
                    intro: 'This area allows you to control looping, playback, and other sound settings.',
                    position: 'top'
                },
                {
                    element: '.sideBar',
                    intro: 'This area allows you to upload, edit, and export notes.',
                    position: 'top'
                },
            ],
            showProgress: true,
            showBullets: false,
        });
    }, []);

    const startTour = () => {
        tour.current.start();
    };

    return (
        <PlayingProvider>
            <Header />
            <div
                id="app"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <FaInfoCircle
                    onClick={startTour}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        fontSize: '24px',
                        color: '#333',
                        cursor: 'pointer',
                        zIndex: 1000,
                    }}
                    title="Start Tour"
                />

                <div style={{ display: 'flex' }}>
                    <TonnetzView notes={notes} className="tonnetzView" />
                    <CircleView className="circleView" />
                    <Sidebar className="sideBar" />
                    
                </div>

{/*                  <div className="loopPlayer" style={{ display: 'flex' }}>
                    <LoopPlayer/>
                </div> */}
            </div>
        </PlayingProvider>
    );
};

export default App;
