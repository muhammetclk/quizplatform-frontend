import React from 'react';

interface TimerRingProps {
  seconds: number;
  totalSeconds: number;
}

const TimerRing: React.FC<TimerRingProps> = ({ seconds, totalSeconds }) => {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const progress = seconds / totalSeconds;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.4) return '#6C63FF';
    if (progress > 0.2) return '#F59E0B';
    return '#EF4444';
  };

  const getClass = () => {
    if (progress > 0.4) return '';
    if (progress > 0.2) return 'warning';
    return 'danger';
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}s`;

  return (
    <div className="timer-ring">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div className={`timer-ring-text ${getClass()}`}>{label}</div>
    </div>
  );
};

export default TimerRing;
