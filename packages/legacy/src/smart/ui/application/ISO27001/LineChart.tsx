import React from 'react';
import MGDLabel from '../../../MGDComponents/MGDLabel';

const LineChart27001: React.FC<{
  values: number[];
  lineRef: number;
  pass?: boolean;
}> = function ({ values, lineRef, pass = true }) {
  const color = pass ? 'green' : 'red';
  return (
    <div
      style={{
        width     : '40%',
        textAlign : 'center',
      }}
    >
      <MGDLabel> # connections (per IP) </MGDLabel>
      <LineChart color={color} values={values} lineRef={lineRef} />
    </div>
  );
};

interface Line {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

const LineChart: React.FC<{
  color: string;
  values: number[];
  lineRef: number;
}> = function ({ color, values, lineRef }) {
  if (values.length < 1) {
    return (
      <svg viewBox="0 0 36 36">
        <text
          style={{
            fill       : color,
            fontSize   : '0.5em',
            textAnchor : 'middle',
          }}
          x="18"
          y="20.35"
        >
          No data
        </text>
      </svg>
    );
  }
  const lines: Line[] = [];
  const max = values.reduce((max, x) => Math.max(max, x), lineRef * 1.05);
  const chartMax = Math.ceil(max / 20) * 20;
  const mapped = values.map(x => mapValue(x, chartMax));
  for (let i = 1; i < mapped.length; i++) {
    const pv = mapped[i - 1];
    const v = mapped[i];
    lines.push({
      fx : i * 10,
      fy : pv,
      tx : (i + 1) * 10,
      ty : v,
    });
  }
  let sep = 10 ** (Math.ceil(Math.log10(chartMax)) - 1);
  if (chartMax / sep > 5) {
    sep *= 2;
  }
  if (chartMax / sep < 2) {
    sep /= 2;
  }
  const marks: number[] = [];
  for (let i = 1; i * sep < chartMax * 0.97; i++) {
    marks.push(i * sep);
  }

  const refy = mapValue(lineRef, chartMax);
  return (
    <svg viewBox="0 0 110 110">
      <line // reference line
        x1={10}
        y1={refy}
        x2={110}
        y2={refy}
        stroke="black"
      />
      <line // x-axis
        x1={0}
        y1={100}
        x2={110}
        y2={100}
        stroke="gray"
      />
      <line // x-axis arrow head 1
        x1={110}
        y1={100}
        x2={107}
        y2={97}
        stroke="gray"
      />
      <line // x-axis arrow head 2
        x1={110}
        y1={100}
        x2={107}
        y2={103}
        stroke="gray"
      />
      <line // y-axis
        x1={10}
        y1={0}
        x2={10}
        y2={110}
        stroke="gray"
      />
      <line // y-axis arrow head 1
        x1={10}
        y1={0}
        x2={13}
        y2={3}
        stroke="gray"
      />
      <line // y-axis arrow head 2
        x1={10}
        y1={0}
        x2={7}
        y2={3}
        stroke="gray"
      />
      <text
        style={{
          fill       : 'black',
          fontSize   : '0.7em',
          textAnchor : 'end',
        }}
        x="110"
        y={refy - 5}
      >
        {lineRef}
      </text>
      <text
        style={{
          fill       : 'black',
          fontSize   : '0.5em',
          textAnchor : 'end',
        }}
        x="9"
        y="109"
      >
        0
      </text>
      {lines.map((l, index) => (
        <line
          key={`line#${index}`}
          x1={l.fx}
          y1={l.fy}
          x2={l.tx}
          y2={l.ty}
          stroke={color}
        />
      ))}
      {marks.map((m, index) => {
        const mapped = mapValue(m, chartMax);
        return (
          <>
            <text
              style={{
                fill       : 'black',
                fontSize   : '0.5em',
                textAnchor : 'end',
              }}
              x="9"
              y={mapped + 9}
            >
              {m}
            </text>
            <line
              key={`mark#${index}`}
              x1="8"
              y1={mapped}
              x2="12"
              y2={mapped}
              stroke="black"
            />
          </>
        );
      })}
    </svg>
  );
};

function mapValue(x: number, max: number): number {
  return 100 - (100 / max) * x;
}

export default LineChart27001;
