import React, { useState, useRef, useEffect } from "react";
import PianoRoll from "../PianoRoll/PianoRoll";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div>
        <div
          id="sidebar-overlay"
          className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-1000 ease-in-out ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-1000 ease-in-out"></div>
          <div
            id="drawer-right-example"
            ref={sidebarRef}
            className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform ${open ? 'translate-x-0' : 'translate-x-full'} bg-white w-[28rem] dark:bg-gray-800`}
            tabIndex="-1"
            aria-labelledby="drawer-right-label"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close menu</span>
            </button>
            <div className="mt-4 px-4 flex-1 overflow-auto">
              <PianoRoll />
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="sideBar fixed bottom-4 right-4 p-4 bg-black text-white rounded-full shadow-lg transform transition duration-1000 ease-in-out hover:scale-110"
        >
          <span className="sr-only">Open Sidebar</span>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M12 3v18"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;