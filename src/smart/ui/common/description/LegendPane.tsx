import React from 'react';
import MGDLegend from '@/smart/MGDComponents/MGDLegend';
import MGDLegendEntry from '@/smart/MGDComponents/MGDLegendEntry';
import type { LegendInterface } from '@/smart/model/States';

const LegendPane: React.FC<{
  list: Record<string, LegendInterface>;
  onLeft: boolean;
  bottom?: boolean;
  arrow?: boolean;
}> = function ({ list, onLeft, bottom = false, arrow = false }) {
  return (
    <MGDLegend onLeft={onLeft} bottom={bottom}>
      {Object.values(list)
        .filter(entry => entry.color !== '')
        .map((value, index) => (
          <MGDLegendEntry
            key={index}
            backgroundColor={value.color}
            text={value.label}
            arrow={arrow}
          />
        ))}
    </MGDLegend>
  );
};

export default LegendPane;
