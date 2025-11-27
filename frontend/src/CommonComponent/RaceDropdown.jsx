import React, { useState } from "react";
import { nationalitiesData } from "@/data";

const RaceDropdown = ({ onSelect, selectedRace }) => {

    return (
        <select
            className="form-select px-4 py-2 rounded-lg border focus:border-[#84cc16] focus:outline-none"
            name="race"
            id="race"
            value={selectedRace}
            onChange={(event) => onSelect(event.target.value)}
        >
            <option value="">Select Race</option>
            {nationalitiesData.map((race, i) => (
                <option key={i} value={race}>
                    {race}
                </option>
            ))}
        </select>
    );
};

export default RaceDropdown;
