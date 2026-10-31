import React, { useMemo } from 'react';

export const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    const colors = ['#ffc907', '#2e9df7', '#8bd1cb', '#ff902a'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 0.8}s`,
    }));
  }, []);

  return (
    <div id="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            backgroundColor: p.backgroundColor,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
};
