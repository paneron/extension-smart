/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@emotion/react'
import React from 'react'
import styled from '@emotion/styled'
// import { EdgeText } from 'react-flow-renderer'
import { ModelWrapper } from '../../model/modelwrapper'
import { MapProfile } from './mapmodel'

const MappingCanvus: React.FC<{
  mapProfile: MapProfile;
  implWrapper: ModelWrapper;
  refWrapper: ModelWrapper;
}> = function ({
  mapProfile,
  implWrapper,
  refWrapper
}) {  
  // const elms:Array<JSX.Element> = []    
  // if (mapfunction !== undefined) {
  //   const froms = mapfunction.froms
  //   data.source.forEach((sprofile, sid) => {
  //     const tset = froms.get(sid)
  //     if (tset !== undefined) {
  //       const ts = tset
  //       data.dest.forEach((tprofile, tid) => {
  //         if (ts.has(tid)) {
  //           const from = sprofile.ref.current
  //           const to = tprofile.ref.current
  //           if (from !== null && to !== null) {
  //             const fbox = from.getBoundingClientRect()
  //             const tbox = to.getBoundingClientRect()
  //             const fx = fbox.x + fbox.width
  //             const fy = fbox.y + fbox.height / 2
  //             const tx = tbox.x - 5
  //             const ty = tbox.y + tbox.height / 2
  //             elms.push(<path key={'ui#mapline#' + sid + '#' + tid} d={'M' + fx + ',' + fy + ' L' + tx + ',' + ty} strokeWidth="1" stroke="black" fill="#f00" markerEnd="url(#triangle)" />)
  //             const cx = (fx + tx) / 2
  //             const cy = (fy + ty) / 2
  //             elms.push(<MyDeleteMappingButton key={'ui#mapping#removebutton#' + sid + '#' + tid} x={cx} y={cy} ns={ns} source={sid} target={tid} />)
  //           }
  //         }
  //       })
  //     }
  //   })    
  // }

  // const mapSet = mapProfile.mapSet[refWrapper.model.meta.namespace] ?? {mapping:{}};  

  Object.values

  return <Canvus>
    <svg width="100%" height="99%">
      <defs>
        <marker id="triangle" viewBox="0 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth="5" markerHeight="5"
              orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="black"/>
        </marker>
      </defs>
    </svg>
  </Canvus>
}

const Canvus = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;  
  right: 0;
  z-index:100;
  pointer-events: none;
`

// const MyDeleteMappingButton: React.FC<{
//   x:number,
//   y:number,
//   source:string,
//   target:string,
//   ns:string
// }> = function ({ x, y, ns, source, target }) {
//   return (
//     <EdgeText
//         x={x}
//         y={y}
//         label="X"
//         labelStyle={{
//           display: 'block',
//           margin: 'auto'
//         }}
//         labelBgStyle={{
//           width: '20px',
//           height: '20px',
//           stroke: 'black'
//         }}
//         labelBgBorderRadius={10}
//         labelBgPadding={[7, 5]}
//         onClick={() => alert('not implemented')}
//       />
//   )
// }

export default MappingCanvus
