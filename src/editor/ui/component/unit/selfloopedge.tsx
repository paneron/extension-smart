/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { FC } from 'react';
import { EdgeProps, EdgeText, getEdgeCenter, getMarkerEnd, getSmoothStepPath, Position } from 'react-flow-renderer';
import { functionCollection } from '../../util/function';
import { MyDeleteEdgeButton } from './normaledge';

//const bgcss:CSSProperties = {
//  width: "20px",
//  height: "20px",
//  stroke: "black",  
//}
//
//const lbcss:CSSProperties = {
//  display: "block",
//  margin: "auto"
//}

const SelfLoopEdge: FC<EdgeProps> = ({
  id,
  source, 
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},  
  arrowHeadType,
  markerEndId,
}) => {  
  let sm = functionCollection.getStateMan()
  let edges:Array<JSX.Element> = []  
  const p1x:number = sourceX + 40
  const p1y:number = sourceY + 30  
  const p2x:number = sourceX + 100
  const p2y:number = sourceY
  const p3x:number = sourceX + 40
  const p3y:number = targetY - 30
  const p4x:number = targetX
  const p4y:number = targetY
  const edgePath1 = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX: p1x, targetY: p1y, targetPosition:Position.Left })
  const edgePath2 = getSmoothStepPath({ sourceX:p1x, sourceY:p1y, sourcePosition:Position.Right, targetX: p2x, targetY: p2y, targetPosition:Position.Bottom })
  const edgePath3 = getSmoothStepPath({ sourceX:p2x, sourceY:p2y, sourcePosition:Position.Top, targetX: p3x, targetY: p3y, targetPosition:Position.Right })
  const edgePath4 = getSmoothStepPath({ sourceX:p3x, sourceY:p3y, sourcePosition:Position.Left, targetX: p4x, targetY: p4y, targetPosition })
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)
  const [centerX, centerY] = getEdgeCenter({sourceX, sourceY:p1y, targetX:(p1x+p2x)/2, targetY:p1y})
  if (sm.state.clvisible || !sm.state.edgeDeleteVisible) {      
    edges.push(<EdgeText key={"ui#edge#label#"+source+"#"+target} x={centerX} y={centerY} label={label}/>)    
  } else {
    edges.push(<MyDeleteEdgeButton key={"ui#edge#removebutton#"+source+"#"+target} x={centerX} y={centerY} source={source} target={target} />)
    edges.push(<EdgeText key={"ui#edge#label#"+source+"#"+target} x={centerX+35} y={centerY} label={label}/>)    
  }
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath1} />
      <path id={id+2} style={style} className="react-flow__edge-path" d={edgePath2} />    
      <path id={id+3} style={style} className="react-flow__edge-path" d={edgePath3} />    
      <path id={id+4} style={style} className="react-flow__edge-path" d={edgePath4} markerEnd={markerEnd} />    
      {edges}
    </>
  );
};

export default SelfLoopEdge;
