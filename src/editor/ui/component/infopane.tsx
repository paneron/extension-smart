/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { useStoreState } from 'react-flow-renderer';
import { NodeData } from '../nodecontainer';
import { Describe } from '../util/descriptor';
import { functionCollection } from '../util/function';

const InfoPane: React.FC<{ clvisible: boolean }> = ({ clvisible }) => {
  return (
    <SideBar>
      <h1>
        Information of selected node
      </h1>
      <div>
        <SelectedNodeDescription isCheckListMode={clvisible} />
      </div>
    </SideBar>
  );
};

export const SelectedNodeDescription: React.FC<{ isCheckListMode: boolean }> =
  function ({ isCheckListMode }) {
    const selected = useStoreState(store => store.selectedElements);

    let desc: JSX.Element = <>Nothing is selected</>;
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      if (s.data instanceof NodeData) {
        const data = functionCollection.getObjectByID(s.data.represent);
        if (data !== undefined) {
          desc = <Describe node={data} isCheckListMode={isCheckListMode} />;
        }
      }
    }
    return desc;
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
