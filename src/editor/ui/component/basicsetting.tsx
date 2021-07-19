/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { StateMan } from '../interface/state';
import RegistryEditPage from './edit/registryedit';
import MetaEditPage from './edit/metaedit';
import RefEditPage from './edit/refedit';
import RoleEditPage from './edit/roleedit';
import { MyTopRightButtons } from './unit/closebutton';
import DataEditPage from './edit/dataedit';
import EnumEditPage from './edit/enumedit';
import VarEditPage from './edit/varedit';

export enum SETTINGPAGE {
  METAPAGE,
  ROLEPAGE,
  REFPAGE,
  REGISTRYPAGE,
  DATAPAGE,
  ENUMPAGE,
  VARPAGE,
}

const BasicSettingPane: React.FC<StateMan> = (sm: StateMan) => {
  const state = sm.state;
  const [page, setPage] = useState<number>(SETTINGPAGE.METAPAGE);

  console.debug('Enter setting page: ', page);

  const close = () => {
    state.svisible = false;
    sm.setState(sm.state);
  };

  const normal: React.CSSProperties = {
    background: '#e7e7e7',
  };

  const selected: React.CSSProperties = {
    background: '#555555',
    color: 'white',
  };

  return (
    <DisplayPane>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
      <div className="tab">
        <button
          onClick={() => setPage(SETTINGPAGE.METAPAGE)}
          style={page === SETTINGPAGE.METAPAGE ? selected : normal}
        >
          {' '}
          Metadata{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.ROLEPAGE)}
          style={page === SETTINGPAGE.ROLEPAGE ? selected : normal}
        >
          {' '}
          Roles{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.REFPAGE)}
          style={page === SETTINGPAGE.REFPAGE ? selected : normal}
        >
          {' '}
          References{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.REGISTRYPAGE)}
          style={page === SETTINGPAGE.REGISTRYPAGE ? selected : normal}
        >
          {' '}
          Data Registry{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.DATAPAGE)}
          style={page === SETTINGPAGE.DATAPAGE ? selected : normal}
        >
          {' '}
          Data structure{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.ENUMPAGE)}
          style={page === SETTINGPAGE.ENUMPAGE ? selected : normal}
        >
          {' '}
          Enumeration{' '}
        </button>
        <button
          onClick={() => setPage(SETTINGPAGE.VARPAGE)}
          style={page === SETTINGPAGE.VARPAGE ? selected : normal}
        >
          {' '}
          Measurement{' '}
        </button>
      </div>
      <MetaEditPage
        model={sm.state.modelWrapper.model}
        isVisible={page === SETTINGPAGE.METAPAGE}
      />
      <RoleEditPage
        model={sm.state.modelWrapper.model}
        isVisible={page === SETTINGPAGE.ROLEPAGE}
      />
      <RefEditPage
        modelWrapper={sm.state.modelWrapper}
        isVisible={page === SETTINGPAGE.REFPAGE}
      />
      <RegistryEditPage
        modelWrapper={sm.state.modelWrapper}
        isVisible={page === SETTINGPAGE.REGISTRYPAGE}
      />
      <DataEditPage
        modelWrapper={sm.state.modelWrapper}
        isVisible={page === SETTINGPAGE.DATAPAGE}
      />
      <EnumEditPage
        modelWrapper={sm.state.modelWrapper}
        isVisible={page === SETTINGPAGE.ENUMPAGE}
      />
      <VarEditPage
        model={sm.state.modelWrapper.model}
        isVisible={page === SETTINGPAGE.VARPAGE}
      />
    </DisplayPane>
  );
};

const DisplayPane = styled.div`
  position: absolute;
  width: 90%;
  height: 90%;
  bottom: 5%;
  left: 5%;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index: 101;
`;

export default BasicSettingPane;
