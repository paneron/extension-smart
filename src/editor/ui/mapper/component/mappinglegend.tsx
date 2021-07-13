import styled from '@emotion/styled';
import React, { CSSProperties } from 'react';

export enum MappedType {
  Exact,
  Component,
  None
}

const MappingLegendPane: React.FC = () => {    
  let legs = [MappedType.Exact, MappedType.Component, MappedType.None]
  let desc = ["Fully mapped", "Partially mapped", "Not mapped"]
  let elms:Array<JSX.Element> = []
  for (let i = 0;i < legs.length;i++) {
    elms.push(<Legend key={"ui#maplegend#"+i} color={getMapResultColor(legs[i])} text={desc[i]} />)
  }  
  
  return (  
    <LegendLabel key="ui#maplegendlabel"> 
      {elms}
    </LegendLabel> 
  )
}

const Legend:React.FC<{color:string, text:string}> = ({color, text}) => {
  let css:CSSProperties = {    
    height: "12px",
    float: "left",
    width: "12px",
    border: "1px solid black",
  }
  css.backgroundColor = color
  return <div> <div style={css} /> {text} </div>
}

export function getMapResultColor(x:MappedType):string {
  if (x == MappedType.Exact) {
    return "lightgreen"
  }
  if (x == MappedType.Component) {
    return "lightyellow"
  }
  // not match
  return "#E9967A"
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