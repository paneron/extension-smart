import styled from '@emotion/styled';
import React from 'react';
import { useStoreState, Elements } from 'react-flow-renderer';
import { NodeData } from '../nodecontainer';
import { describe } from '../util/descriptor';
import { functionCollection } from '../util/function';

const InfoPane: React.FC<{ clvisible: boolean }> = ({ clvisible }) => {
  const selected = useStoreState(store => store.selectedElements);

  const updateSelection = (selected: Elements<any> | null) => {
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      if (s.data instanceof NodeData) {
        const data = functionCollection.getObjectByID(s.data.represent);
        if (data !== undefined) {
          return describe(data, clvisible);
        }
      }
    }
    return 'Nothing is selected';
  };

  return (
    <SideBar key="ui#InfoPaneSideBar">
      <h1> Information of selected node </h1>
      <div> {updateSelection(selected)} </div>
    </SideBar>
  );
};

const SideBar = styled.aside`
  position: fixed;
  width: 30%;
  height: 100%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
`;

export default InfoPane;
