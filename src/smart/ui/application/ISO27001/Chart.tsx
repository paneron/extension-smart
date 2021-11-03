import React from 'react';
import MGDLabel from '../../../MGDComponents/MGDLabel';
import { Log27001Record, SettingRange } from './model';

const path =
  'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

const ChartItem: React.FC<{
  result?: Log27001Record;
  range: SettingRange;
}> = function ({ result, range }) {
  const color =
    result !== undefined && !result.result.overall ? 'red' : 'green';
  const percentage =
    result === undefined ? NaN : (result.data.failed * 100) / result.data.login;
  return (
    <div
      style={{
        width: '40%',
        textAlign: 'center',
      }}
    >
      <MGDLabel>Percentage of failed login</MGDLabel>
      <Chart color={color} percentage={percentage} range={range} />
    </div>
  );
};

const Chart: React.FC<{
  color: string;
  percentage: number;
  range: SettingRange;
}> = function ({ color, percentage, range }) {
  const reading = Math.min(
    Math.max(((percentage - range.min) * 100) / (range.max - range.min), 0),
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
          fill: color,
          fontSize: '0.5em',
          textAnchor: 'middle',
        }}
        x="18"
        y="20.35"
      >
        {isNaN(percentage) ? 'No data' : `${percentage.toFixed(2)}%`}
      </text>
    </svg>
  );
};

export default ChartItem;
