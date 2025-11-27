import React, { useContext } from 'react';
import ActionProviderContext from './ActionProviderContext';

const CustomButton = () => {
  const actionProvider = useContext(ActionProviderContext);

  const handleClick = () => {
    if (actionProvider.handleInput) {
      actionProvider.handleInput("Let's go");
    }
  };

  return (
    <button onClick={handleClick} style={{ padding: '10px', marginLeft:'75px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      Let&apos;s Go
    </button>
  );
};

export default CustomButton;
