/** @jsx jsx */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELRegistry } from '../../serialize/interface/datainterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { StateMan } from '../interface/state';
import { DataIndexer, DataIndexRecord } from '../util/datasearchmanager';
import { MyTopRightButtons } from './unit/closebutton';
import NormalComboBox from './unit/combobox';

const IndexPane: React.FC<{ sm: StateMan; index: DataIndexer }> = ({
  sm,
  index,
}) => {
  const mw = sm.state.modelWrapper;
  const [data, setData] = useState<MMELRegistry | null>(null);
  const { setCenter } = useZoomPanHelper();
  const elms: Array<JSX.Element> = [];
  const datatext = data == null ? '' : data.id;
  const options: Array<string> = [''];
  for (const dc of mw.model.regs) {
    options.push(dc.id);
  }

  if (data != null) {
    const records = index.get(data);
    for (const r of records) {
      if (r.elm.element?.datatype == DataType.PROCESS) {
        const process = r.elm.element as MMELProcess;
        elms.push(
          <p
            key={
              r.history.top().id + '#componentText#' + process.id + '#' + r.type
            }
          >
            {process.id} : {process.name}
          </p>
        );
      } else if (r.elm.element?.datatype == DataType.APPROVAL) {
        const approval = r.elm.element as MMELApproval;
        elms.push(
          <p
            key={
              r.history.top().id +
              '#componentText#' +
              approval.id +
              '#' +
              r.type
            }
          >
            {approval.id} : {approval.name}
          </p>
        );
      }
      elms.push(
        <p
          key={
            r.history.top().id +
            '#navigationButtonText#' +
            r.elm.element?.id +
            '#' +
            r.type
          }
        >
          Type: {r.type}{' '}
          <button
            key={
              r.history.top().id +
              '#navigationbutton#' +
              r.elm.element?.id +
              '#' +
              r.type
            }
            onClick={() => visit(r)}
          >
            {' '}
            Go{' '}
          </button>
        </p>
      );
    }
  }

  const visit = (r: DataIndexRecord) => {
    sm.state.history.clear();
    sm.state.history.copyContent(r.history);
    sm.state.modelWrapper.page = r.history.top();
    sm.state.highlight = r.elm.element;
    setCenter(r.elm.x, r.elm.y);
    sm.setState({ ...sm.state });
  };

  const close = () => {
    sm.state.searchvisible = false;
    sm.state.highlight = null;
    sm.setState(sm.state);
  };

  const update = (x: string) => {
    const dc = sm.state.modelWrapper.idman.regs.get(x);
    if (dc != undefined) {
      setData(dc);
    } else {
      setData(null);
    }
    if (sm.state.highlight != null) {
      sm.state.highlight = null;
      sm.setState({ ...sm.state });
    }
  };

  return (
    <SideBar key="ui#IndexPaneSideBar">
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>
      <p key="ui#DataProcessNavigationText"> Data - Process Navigator </p>
      <NormalComboBox
        text="Data Registry"
        options={options}
        value={datatext}
        update={update}
      />
      {elms}
    </SideBar>
  );
};

const SideBar = styled.aside`
  position: absolute;
  width: 35%;
  height: 50%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default IndexPane;
