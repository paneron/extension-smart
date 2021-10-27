import React from 'react';
import MGDLegend from '../../../MGDComponents/MGDLegend';
import MGDLegendEntry from '../../../MGDComponents/MGDLegendEntry';
import { LegendInterface } from '../../../model/States';

const LegendPane: React.FC<{
  list: Record<string, LegendInterface>;
  onLeft: boolean;
  bottom?: boolean;
}> = function ({ list, onLeft, bottom = false }) {
  return (
    <MGDLegend onLeft={onLeft} bottom={bottom}>
      {Object.values(list)
        .filter(entry => entry.color !== '')
        .map((value, index) => (
          <MGDLegendEntry
            key={'ui#maplegend#' + index}
            backgroundColor={value.color}
            text={value.label}
          />
        ))}
    </MGDLegend>
  );
};

export default LegendPane;
