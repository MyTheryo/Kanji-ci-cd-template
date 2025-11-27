import React, { useState } from "react";
import { countriesData } from "@/data";
const EthnicityDropdown = ({ onSelect, selectedEthnicity }) => {

    return (
        <>
            <select
                className="form-select px-4 py-2 rounded-lg border focus:border-[#84cc16] focus:outline-none"
                name="ethnicity"
                id="ethnicity"
                value={selectedEthnicity}
                onChange={(event) => onSelect(event.target.value)}
            >
                <option value="">Select Ethnicity</option>
                {countriesData.map((ethnicity, i) => (
                    <option key={i} value={ethnicity}>
                        {ethnicity}
                    </option>
                ))}
            </select>
        </>
    );
};

export default EthnicityDropdown;
