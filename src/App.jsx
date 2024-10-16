import React, { useState, useRef, useEffect } from 'react';
import IntroJs from 'intro.js';
import 'intro.js/introjs.css';
import { FaInfoCircle } from 'react-icons/fa';
import CircleView from './components/CircleView';
import TonnetzView from './components/TonnetzView';
import LoopPlayer from './components/LoopPlayer';
import Sidebar from './components/sidebar/SideBar';
import { PlayingProvider } from './context/PlayingContext';
import Header from './components/Header'; // Import the Header component

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
                    intro: 'This is the Tonnetz grid, where you can explore musical relationships.',
                    position: 'right'
                },
                {
                    element: '.circleView',
                    intro: 'These circles display the notes and chords within the Tonnetz grid in a circular layout.',
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
