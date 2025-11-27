import React, { useEffect, useState } from "react";
import languages from 'iso-639-1';

const LanguageDropdown = ({ onSelect, selectedLanguage }) => {
    const languageNames = languages.getAllNames();

    return (
        languageNames.length > 0 && (
            <select
                className="form-select px-4 py-2 rounded-lg border focus:border-[#84cc16] focus:outline-none"
                name="languages"
                id="languages"
                value={selectedLanguage}
                onChange={(event) => onSelect(event.target.value)}
            >
                <option value="">Select Language</option>
                {languageNames.map((language) => (
                    <option key={language} value={language}>
                        {language}
                    </option>
                ))}
            </select>
        )
    );
};

export default LanguageDropdown;
