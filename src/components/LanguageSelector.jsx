// src/LanguageSelector.jsx
import React from 'react';

const LanguageSelector = ({ value, languages, onLanguageChange }) => {
  return (
    <div className="languageSwitcher">
      {languages.map((lang, index) => (
        <div
          key={index}
          className={`cursor-pointer p-2 border rounded ${value === lang ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
          onClick={() => onLanguageChange(lang)}
        >
          {lang}
        </div>
      ))}
    </div>
  );
};

export default LanguageSelector;