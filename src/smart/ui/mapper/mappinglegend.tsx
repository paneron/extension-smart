import React, { CSSProperties } from 'react';
import { MapStyleInterface } from './MappingCalculator';

const MappingLegendPane: React.FC<{
  list: Record<string, MapStyleInterface>;
  style?: CSSProperties;
}> = function ({ list, style = {}}) {  
  return (
    <div style={ style } >
      {Object.values(list).map(
        (value, index) => (<Legend key={'ui#maplegend#' + index} color={value.color} text={value.label} />)
      )}
    </div>
  )
}

const Legend:React.FC<{
  color:string;
  text:string
}> = ({ color, text }) => {
  return (
    <div>
      <div style={{
        backgroundColor: color,
        height: '12px',
        float: 'left',
        width: '12px',
        border: '1px solid black',
        borderRadius: '3px'
      }} 
      />
      {text} 
    </div>
  )
}

export default MappingLegendPane
