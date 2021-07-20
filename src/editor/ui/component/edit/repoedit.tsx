/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { DocumentItem } from '../../../repository/document';
import { StateMan } from '../../interface/state';
import { DataRepoHandler } from '../handle/datarepohandler';
import { MyTopRightButtons } from '../unit/closebutton';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const RepoEditPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;
  const isVisible = state.datarepo !== null;

  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [doc, setUpdateDoc] = useState<DocumentItem | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<DocumentItem>(new DocumentItem(0));

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new DataRepoHandler(
    state.modelWrapper.model,
    state.datastore,
    state.datarepo,
    doc,
    setAddMode,
    setUpdateMode,
    setUpdateDoc,
    forceUpdate,
    data,
    setData
  );

  const close = () => {
    state.datarepo = null;
    sm.setState(sm.state);
  };

  //const normal: React.CSSProperties = {
  //  background: '#e7e7e7',
  //};

  //const selected: React.CSSProperties = {
  //  background: '#555555',
  //  color: 'white',
  //};

  return (
    <DisplayPane style={{ display: isVisible ? 'inline' : 'none' }}>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
      <h1>{state.datarepo?.title}</h1>
      <div
        style={{
          display: isVisible && !isAdd && !isUpdate ? 'inline' : 'none',
        }}
      >
        <ListManagerPane {...handle} />
      </div>
      <div style={{ display: isVisible && isAdd ? 'inline' : 'none' }}>
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: isVisible && isUpdate ? 'inline' : 'none' }}>
        <ItemUpdatePane {...handle} />
      </div>
    </DisplayPane>
  );
};

const DisplayPane = styled.div`
  position: fixed;
  width: 70%;
  height: 100%;
  bottom: 0;
  left: 0;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index: 101;
`;

export default RepoEditPane;
