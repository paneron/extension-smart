import styled from '@emotion/styled'
import React, { RefObject } from 'react'
import { SearchMan, StateMan } from '../interface/state'
import { calculateFilter } from '../util/filtermanager'
import { MyCloseButtons } from './unit/closebutton'

const selectbox:RefObject<HTMLSelectElement> = React.createRef()
const authorselectbox:RefObject<HTMLSelectElement> = React.createRef()

const FilterPane: React.FC<{sm:StateMan, ssm: SearchMan}> = ({sm, ssm}) => {        
  let state = sm.state
  let ss = ssm.searchState
  let modelWrapper = state.modelWrapper  

  const close = () => {
    state.fpvisible = false    
    sm.setState(sm.state)    
  }

  let docoptions:Array<JSX.Element> = []
  let i = 0
  docoptions.push(<option key="docfilter#default" value="">No filter</option>)  
  modelWrapper.documents.forEach((v, k) => docoptions.push(<option key={"docfilter#"+i++}value={k}>{k}</option>))

  let clauseoptions:Array<JSX.Element> = []
  i = 0
  clauseoptions.push(<option key="clausefilter#default" value="">No filter</option>)
  if (ss.document != "") {
    let index = modelWrapper.documents.get(ss.document)
    if (index != undefined) {
      modelWrapper.clauses[index].forEach((v) => clauseoptions.push(<option key={"clausefilter#"+i++} value={v}>{v}</option>))
    }
  }  

  let actoroptions:Array<JSX.Element> = []
  actoroptions.push(<option key="actorfilter#default" value="">No filter</option>)
  modelWrapper.model.roles.forEach((r) => {
     actoroptions.push(<option key={"actorfilter#"+i++} value={r.name}>{r.name}</option>)
  })

  let clauseFilter:Array<JSX.Element> = []
  clauseFilter.push(<p key="ui#filter#clausetext"> Clause filter: </p>)
  clauseFilter.push(<select key="ui#filter#clauseoptions" value={ss.clause} ref={selectbox} onChange={(e) => {
      ss.clause = e.target.value
      calculateFilter(state.modelWrapper, ssm.searchState)
      ssm.setSearchState(ss)
    }}>
      {clauseoptions}
    </select>)

  return <ControlBar>
    <MyCloseButtons onClick={() => close()}>X</MyCloseButtons>
    <p> Reference filter: </p>
    <select value={ss.document} onChange={(e) => {
      if (selectbox.current != null) {
        selectbox.current.value = ""
      }
      ss.document = e.target.value
      ss.clause = ""
      calculateFilter(state.modelWrapper, ssm.searchState)
      ssm.setSearchState(ss)
    }}>
      {docoptions}
    </select>
    {ss.document != ""?clauseFilter:""}
    <p> Actor filter: </p>
    <select value={ss.actor} ref={authorselectbox} key="ActorFilterBox" onChange={(e) => {
      ss.actor = e.target.value
      calculateFilter(state.modelWrapper, ssm.searchState)
      ssm.setSearchState(ss)
    }}>
      {actoroptions}
    </select>
    <p> <button onClick={()=> {
      state.onepage = true
      sm.setState({...state})
    }}> One-page checklist </button> </p>
    </ControlBar>
}

const ControlBar = styled.aside`
  position: absolute;
  width: 25%;
  height: 50%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index:100;  
`;

export default FilterPane