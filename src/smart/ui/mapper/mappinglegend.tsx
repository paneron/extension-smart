import React from 'react';
import MGDLegend from '../../MGDComponents/MGDLegend';
import MGDLegendEntry from '../../MGDComponents/MGDLegendEntry';
import { MapStyleInterface } from './MappingCalculator';

const MappingLegendPane: React.FC<{
  list: Record<string, MapStyleInterface>;
  onLeft: boolean;
}> = function ({ list, onLeft }) {
  return (
    <MGDLegend onLeft={onLeft}>
      {Object.values(list).map((value, index) => (
        <MGDLegendEntry
          key={'ui#maplegend#' + index}
          backgroundColor={value.color}
          text={value.label}
        />
      ))}
    </MGDLegend>
  );
};

export default MappingLegendPane;
