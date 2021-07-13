/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';

export const datacubeShape = (color: string) => (
  <svg height="40" width="40">
    <polygon points="3,10 31,10 31,38, 3,38" fill={color} stroke="black" />
    <polygon points="3,10 31,10 39,2, 11,2" fill={color} stroke="black" />
    <polygon points="31,38 31,10 39,2, 39,30" fill={color} stroke="black" />
  </svg>
);

export const startShape = (color: string) => (
  <svg height="40" width="40">
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="black"
      strokeWidth="2"
      fill={color}
    />
  </svg>
);

export const endShape = (color: string) => (
  <svg height="40" width="40">
    <circle
      cx="20"
      cy="20"
      r="15"
      stroke="black"
      strokeWidth="5"
      fill={color}
    />
  </svg>
);

export const timerShape = (color: string) => (
  <svg height="40" width="40">
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="black"
      strokeWidth="2"
      fill={color}
    />
    <circle
      cx="20"
      cy="20"
      r="14"
      stroke="black"
      strokeWidth="2"
      fill={color}
    />
    <line x1="20" y1="20" x2="20" y2="10" stroke="black" strokeWidth="2" />
    <line x1="20" y1="20" x2="24" y2="26" stroke="black" strokeWidth="2" />
  </svg>
);

export const egateShape = (color: string) => (
  <svg height="40" width="40">
    <polygon
      points="0,20 20,0 40,20, 20,40"
      fill={color}
      stroke="black"
      strokeWidth="2"
    />
  </svg>
);

export const signalCatchShape = (color: string) => (
  <svg height="40" width="40">
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="black"
      strokeWidth="2"
      fill={color}
    />
    <line x1="10" y1="30" x2="30" y2="30" stroke="black" strokeWidth="2" />
    <line x1="10" y1="30" x2="20" y2="10" stroke="black" strokeWidth="2" />
    <line x1="30" y1="30" x2="20" y2="10" stroke="black" strokeWidth="2" />
  </svg>
);

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
