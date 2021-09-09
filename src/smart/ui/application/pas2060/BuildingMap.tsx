/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { CSSProperties } from 'react';
import { Text } from '@blueprintjs/core';
import MGDContainer from '../../../MGDComponents/MGDContainer';
import { Application2060Setting, colors2060, EmissionSource } from './model';
import MyMapBackground from './MyMapBackground';

type NumberedEmissionSource = EmissionSource & {
  pos: number;
};

const cssStyle: CSSProperties = {
  width: '200px',
  zIndex: 16,
  padding: 0,
};

const BuildingMap: React.FC<{
  setting: Application2060Setting;
}> = function ({ setting }) {
  const source = setting.emissions
    .map(
      (e, index): NumberedEmissionSource => ({
        ...e,
        pos: index + 1,
      })
    )
    .filter(e => e.box !== undefined);
  if (source.length === 0) {
    return (
      <fieldset>
        <legend>Minimap</legend>
        <MGDContainer>
          <Text>No data</Text>
        </MGDContainer>
      </fieldset>
    );
  } else {
    const [minx, maxx, miny, maxy] = source
      .map(e => [e.box!.minx, e.box!.maxx, e.box!.miny, e.box!.maxy])
      .reduce((p, x) => [
        Math.min(p[0], x[0]),
        Math.max(p[1], x[1]),
        Math.min(p[2], x[2]),
        Math.max(p[3], x[3]),
      ]);
    const width = maxx - minx;
    const height = maxy - miny;
    const size = Math.max(width, height);
    const sizeWithBorder = size + 4;
    const cornerx = minx - 2;
    const cornery = miny - 2;
    return (
      <fieldset>
        <legend>Minimap</legend>
        <MGDContainer>
          <MyMapBackground x={minx} y={miny} size={size} />
          <div style={cssStyle}>
            <svg
              viewBox={`${cornerx} ${cornery} ${sizeWithBorder} ${sizeWithBorder}`}
            >
              {source.map(e => (
                <BuildingItem key={`emissionsource#${e.pos}`} contents={e} />
              ))}
            </svg>
          </div>
        </MGDContainer>
      </fieldset>
    );
  }
};

const BuildingItem: React.FC<{
  contents: NumberedEmissionSource;
}> = function ({ contents }) {
  const { minx, miny, maxx, maxy } = contents.box!;
  const colorindex = (contents.pos + 3) % colors2060.length;
  const color = colors2060[colorindex];
  return (
    <>
      <polygon
        points={`${minx},${miny} ${maxx},${miny} ${maxx},${maxy} ${minx},${maxy}`}
        fill={color}
        stroke="black"
      />
      <text
        style={{
          fill: 'black',
          fontSize: 10,
          textAnchor: 'middle',
        }}
        x={(minx + maxx) / 2}
        y={(miny + maxy) / 2 + 4}
      >
        {contents.pos}
      </text>
    </>
  );
};

export default BuildingMap;
