/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';

const path =
  'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

const CircleGraph: React.FC<{
  color?: string;
  percentage: number;
  textcolor?: string;
  min?: number;
  max?: number;
}> = function ({
  color = 'green',
  percentage,
  textcolor = 'green',
  min = 0,
  max = 100,
}) {
  const reading = Math.min(
    Math.max(((percentage - min) * 100) / (max - min), 0),
    100
  );
  return (
    <svg viewBox="0 0 36 36">
      <path
        style={{
          fill: 'none',
          stroke: 'lightgray',
          strokeWidth: 3.8,
        }}
        d={path}
      />
      <path
        style={{
          fill: 'none',
          stroke: color,
          strokeWidth: 2.8,
          strokeLinecap: 'round',
        }}
        stroke-dasharray={`${reading}, 100`}
        d={path}
      />
      <text
        style={{
          fill: textcolor,
          fontSize: '0.5em',
          textAnchor: 'middle',
        }}
        x="18"
        y="20.35"
      >
        {isNaN(percentage)
          ? 'No data'
          : `${parseFloat(percentage.toFixed(2))}%`}
      </text>
    </svg>
  );
};

export default CircleGraph;
