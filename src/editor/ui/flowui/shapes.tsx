import styled from '@emotion/styled';
import React from 'react';

export const DatacubeShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <polygon points="3,10 31,10 31,38, 3,38" fill={color} stroke="black" />
      <polygon points="3,10 31,10 39,2, 11,2" fill={color} stroke="black" />
      <polygon points="31,38 31,10 39,2, 39,30" fill={color} stroke="black" />
    </svg>
  );
};

export const StartShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
    </svg>
  );
};

export const EndShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="15"
        stroke="black"
        strokeWidth="5"
        fill={color}
      />
    </svg>
  );
};

export const TimerShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <circle
        cx="20"
        cy="21"
        r="14"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="20" y1="21" x2="20" y2="11" stroke="black" strokeWidth="2" />
      <line x1="20" y1="21" x2="24" y2="27" stroke="black" strokeWidth="2" />
    </svg>
  );
};

export const EgateShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="41" width="40">
      <polygon
        points="2,22 20,4 38,22 20,40"
        fill={color}
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};

export const SignalCatchShape: React.FC<{ color?: string }> = function ({
  color = 'none',
}) {
  return (
    <svg height="40" width="40">
      <circle
        cx="20"
        cy="21"
        r="18"
        stroke="black"
        strokeWidth="2"
        fill={color}
      />
      <line x1="10" y1="31" x2="30" y2="31" stroke="black" strokeWidth="2" />
      <line x1="10" y1="31" x2="20" y2="11" stroke="black" strokeWidth="2" />
      <line x1="30" y1="31" x2="20" y2="11" stroke="black" strokeWidth="2" />
    </svg>
  );
};

export const ProcessBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 5px;
  border: 1px;
  width: 150px;
  height: 40px;
  font-size: 10px;
  border-style: solid;
`;