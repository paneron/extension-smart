import styled from '@emotion/styled';
import React, { CSSProperties } from 'react';
import { useStoreState, Elements } from 'react-flow-renderer';
import { MMELNode } from '../../../serialize/interface/baseinterface';
import { NodeData } from '../../nodecontainer';
import { ModelViewStateMan } from '../model/mapperstate';
import { MapperFunctions } from '../util/helperfunctions';
import { MappingDescribe } from '../util/mapperdescribe';

const MapperInfoPane: React.FC<ModelViewStateMan> = (sm: ModelViewStateMan) => {
  const selected = useStoreState(store => store.selectedElements);

  const css: CSSProperties = {
    display: sm.state.infovisible ? 'inline' : 'none',
  };

  const updateSelection = (selected: Elements<any> | null) => {
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      if (s.data instanceof NodeData) {
        const data = MapperFunctions.getObjectByID(sm, s.data.represent);
        if (data !== undefined) {
          return MappingDescribe(data as MMELNode);
        }
      }
    }
    return 'Nothing is selected';
  };

  return (
    <SideBar style={css}>
      <h1> Information of selected node </h1>
      <div> {updateSelection(selected)} </div>
    </SideBar>
  );
};

const SideBar = styled.aside`
  position: absolute;
  width: 25%;
  height: 70%;
  top: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default MapperInfoPane;
