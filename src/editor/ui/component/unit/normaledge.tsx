import React, { CSSProperties, FC } from 'react';
import { EdgeProps, EdgeText, getEdgeCenter, getMarkerEnd, getSmoothStepPath, Position } from 'react-flow-renderer';
import { Cleaner } from '../../util/cleaner';
import { functionCollection } from '../../util/function';

const NormalEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,  
  arrowHeadType,
  markerEndId,
}) => {
  let sm = functionCollection.getStateMan()
  let edges:Array<JSX.Element> = []  
  if (targetY > sourceY) {    
    const edgePath1 = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)    
    const [centerX, centerY] = getEdgeCenter({sourceX, sourceY, targetX, targetY})
    if (sm.state.clvisible || !sm.state.edgeDeleteVisible) {      
      edges.push(<EdgeText key={"ui#edge#label#"+source+"#"+target} x={centerX} y={centerY} label={label}/>)    
    } else {
      edges.push(<MyDeleteEdgeButton key={"ui#edge#removebutton#"+source+"#"+target} x={centerX} y={centerY} source={source} target={target} />)
      edges.push(<EdgeText key={"ui#edge#label#"+source+"#"+target} x={centerX+35} y={centerY} label={label}/>)    
    }
    return <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath1} markerEnd={markerEnd} />          
      {edges}
    </>
  }
  const widthmargin = 160
  let dx = 0, dx2 = 0
  if (targetX < sourceX) {
    // edge goes to left
    dx = -1
    dx2 = sourceX - targetX < widthmargin?-1:1
  } else {
    // targetX >= sourceX
    dx = 1
    dx2 = targetX - sourceX < widthmargin?1:-1
  }  
  const p1x:number = sourceX + dx * 40
  const p1y:number = sourceY + 30  
  const p2x:number = targetX + dx2 * 100
  const p2y:number = sourceY
  const p3x:number = targetX + dx2 * 40
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

export default NormalEdge;

const bgcss:CSSProperties = {
  width: "20px",
  height: "20px",
  stroke: "black",  
}

const lbcss:CSSProperties = {
  display: "block",
  margin: "auto"
}

export const MyDeleteEdgeButton: FC<{x:number, y:number, source:string, target:string}> = ({x, y, source, target}) => {
  return (
    <EdgeText        
        x={x}
        y={y}
        label="X"       
        labelStyle={lbcss}         
        labelBgStyle={bgcss}
        labelBgBorderRadius={10}
        labelBgPadding={[7, 5]}
        onClick={() => Cleaner.removeEdge(source, target)}
      />
  )
}