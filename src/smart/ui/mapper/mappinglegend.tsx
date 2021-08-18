import styled from '@emotion/styled'
import React from 'react';
import { MappingResultStyles } from './MappingCalculator';

const MappingLegendPane: React.FC = function () {
  return (
    <LegendLabel key="ui#maplegendlabel">
      {Object.values(MappingResultStyles).map(
        (value, index) => (<Legend key={'ui#maplegend#' + index} color={value.color} text={value.label} />)
      )}
    </LegendLabel>
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

const LegendLabel = styled.div`
position: absolute;
top: 20px;
right: 1%;
font-size: 12px;
overflow-y: auto;
z-index:90;
`

export default MappingLegendPane
