import React from 'react';

interface LearnScreenProps {
  onBack: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({ onBack }) => {
  return (
    <section id="learn-screen" className="screen">
      <h2>Every Drop Matters</h2>
      <img
        src="/img/cw_logo.png"
        alt="charity: water logo"
        className="learn-logo"
      />
      <p>
        Access to clean water supports health, education, and oppurtunity. 
        Charity: water works to bring clean and safe drinking water to communities around the world.
      </p>
      <p>Small actions can help raise awareness of the global water crisis.</p>
      <a
        href="https://www.charitywater.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit charity: water
      </a>
      <div>
        <button id="learn-back" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </section>
  );
};
