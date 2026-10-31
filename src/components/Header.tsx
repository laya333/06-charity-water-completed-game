import React from 'react';

interface HeaderProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMuted = false, onToggleMute }) => {
  return (
    <header className="brand-header">
      <div className="header-content">
        <div className="header-spacer" aria-hidden="true" />
        <img
          src="/img/cw_logo_horizontal.png"
          alt="charity: water"
          className="brand-logo"
        />
        {onToggleMute ? (
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            title={isMuted ? 'Sound muted (click to unmute)' : 'Sound on (click to mute)'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        ) : (
          <div className="header-spacer" aria-hidden="true" />
        )}
      </div>
    </header>
  );
};
