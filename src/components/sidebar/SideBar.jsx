import React, { useState } from "react";
import PianoApp from "../PianoApp";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div>
        {open && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-semibold text-black">Sidebar</h2>
                    <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 px-4 flex-1 overflow-auto">
                    <div className="h-16 w-full">
                      <PianoApp />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        {!open && (
          <button onClick={() => setOpen(true)} className="px-4 py-2 bg-black text-white rounded-md">
            Open Sidebar
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;