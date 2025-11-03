import React, { useState, useEffect, useCallback, useMemo } from 'react';

// The main application component
const TimerCountDown = () => {
  // Initial duration in seconds
  const INITIAL_DURATION = 20;

  // State to hold the time remaining in seconds
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_DURATION);
  // State to track if the timer is actively counting down. Changed to true to start automatically.
  const [isRunning, setIsRunning] = useState(true);

  // --- Timer Control Functions ---

  // Function to start the timer
  const startTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  // Function to pause the timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Function to reset the timer to the initial duration
  const resetTimer = useCallback(() => {
    setIsRunning(false); // Keep it paused after reset
    setTimeRemaining(INITIAL_DURATION);
  }, []);

  // --- Countdown Logic (useEffect) ---
  useEffect(() => {
    let intervalId = null;

    if (isRunning && timeRemaining > 0) {
      // Set up the interval to decrement the time every second
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Automatically pause when the countdown is finished
      setIsRunning(false);
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when dependencies (isRunning, timeRemaining) change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeRemaining]); // Re-run effect when these dependencies change

  // --- Display Formatting ---

  // Memoize the displayed time string to avoid unnecessary re-calculations
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    // Pad single digits with a leading zero (e.g., 05 instead of 5)
    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(minutes)}:${pad(seconds)}`;
  }, [timeRemaining]);

  // Determine the color of the display based on time remaining and state
  const displayClass = useMemo(() => {
    if (timeRemaining === 0) {
      return 'text-red-500 ring-red-300'; // Finished
    }
    if (isRunning && timeRemaining <= 5) {
      return 'text-amber-500 ring-amber-300 animate-pulse'; // Last 5 seconds warning
    }
    if (isRunning) {
      return 'text-green-600 ring-green-300'; // Running
    }
    return 'text-gray-600 ring-gray-300'; // Paused/Ready
  }, [isRunning, timeRemaining]);


  // --- Rendered Component ---

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white shadow-2xl rounded-xl p-8 space-y-8 transform transition duration-500 hover:shadow-3xl">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
          Countdown Timer
        </h1>

        {/* Timer Display */}
        <div className={`p-6 text-center text-7xl font-mono font-bold border-4 rounded-xl transition-all duration-500 ${displayClass} ring-4`}>
          {formattedTime}
        </div>
        
        {/* Status Message */}
        <p className="text-center text-sm font-medium h-5">
            {timeRemaining === 0 
                ? <span className="text-red-600 font-bold">Time's Up!</span> 
                : isRunning 
                    ? <span className="text-green-600">Counting down...</span>
                    : <span className="text-gray-500">Paused</span>
            }
        </p>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          
          {/* Start/Pause Button */}
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={timeRemaining === 0}
            className={`
              flex-1 py-3 px-6 rounded-lg text-white font-semibold shadow-lg transition-all duration-200
              ${isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300' // Pause style
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-green-300' // Start style
              }
              disabled:cursor-not-allowed
            `}
          >
            {isRunning ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 000 2h4a1 1 0 000-2H8z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start
              </>
            )}
          </button>
          
          {/* Reset Button */}
          <button
            onClick={resetTimer}
            className="flex-1 py-3 px-6 rounded-lg bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.564 1 1 0 11-1.668 1.054A5.002 5.002 0 005 8V6a1 1 0 00-2 0v5a1 1 0 001 1h5a1 1 0 100-2H6.108c.325-1.18 1.024-2.28 2.03-3.08A7.002 7.002 0 0116.9 10a1 1 0 002-1.84A9.002 9.002 0 004 3V2a1 1 0 011-1h5a1 1 0 100-2H5a1 1 0 00-1 1z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Initial Duration: {INITIAL_DURATION} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default TimerCountDown;
