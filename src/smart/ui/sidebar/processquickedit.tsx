/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import React, { CSSProperties } from 'react';
import { EditorProcess, ModelType } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { EditAction } from '../../utils/constants';
import { NodeCallBack } from '../flowui/container';
import {
  ActorDescription,
  DescriptionItem,
  EditButton,
  NonEmptyFieldDescription,
  ReferenceList,
  RemoveButton,
} from './selected';

export const ProcessQuickEdit: React.FC<
  NodeCallBack & {
    process: EditorProcess;
    resetSelection: () => void;
    onSubprocessClick: (pid: string) => void;
  }
> = ({
  process,
  modelType,
  getProvisionById,
  getRefById,
  getRoleById,
  setDialog,
  resetSelection,
  onSubprocessClick,
}) => {
  return (
    <>
      {modelType === ModelType.EDIT && (
        <ButtonGroup>
          <EditButton
            cid={process.id}
            callback={() =>
              setDialog(
                DataType.PROCESS,
                EditAction.EDIT,
                process.id,
                resetSelection
              )
            }
          />
          {process.page === '' && (
            <AddPageButton callback={() => onSubprocessClick(process.id)} />
          )}
          <RemoveButton
            cid={process.id}
            callback={() =>
              setDialog(
                DataType.PROCESS,
                EditAction.DELETE,
                process.id,
                resetSelection
              )
            }
          />
        </ButtonGroup>
      )}
      <DescriptionItem
        id={process.id + '#ProcessID'}
        label={'Process'}
        value={process.id}
      />
      <DescriptionItem
        id={process.id + '#ProcessName'}
        label={'Name'}
        value={process.name}
      />
      <ActorDescription
        role={getRoleById(process.actor)}
        id={process.id + '#ProcessActor'}
        label="Actor"
      />
      <NonEmptyFieldDescription
        id={process.id + '#Modality'}
        label="Modality"
        value={process.modality}
      />
      <ProvisionList
        pid={process.id}
        provisions={process.provision}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
      />
    </>
  );
};

const ProvisionList: React.FC<{
  provisions: Set<string>;
  pid: string;
  getProvisionById: (id: string) => MMELProvision | null;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ provisions, pid, getProvisionById, getRefById }) {
  const pros: MMELProvision[] = [];
  provisions.forEach(r => {
    const ret = getProvisionById(r);
    if (ret !== null) {
      pros.push(ret);
    }
  });
  return (
    <>
      {provisions.size > 0 ? (
        <>
          <p key={pid + '#Provisions'}>Provisions</p>
          <ul key={pid + '#ProvisionList'}>
            {pros.map((provision: MMELProvision) => (
              <li key={pid + '#Pro#' + provision.id}>
                {' '}
                <DescribeProvision
                  provision={provision}
                  getRefById={getRefById}
                />{' '}
              </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

const DescribeProvision: React.FC<{
  provision: MMELProvision;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ provision, getRefById }) {
  const css: CSSProperties = {};
  if (provision.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  return (
    <>
      <DescriptionItem
        id={'ui#provisionStatementLabel#' + provision.id}
        label="Statement"
        css={css}
        value={provision.condition}
      />
      <NonEmptyFieldDescription
        id={'ui#provisionModalityLabel#' + provision.id}
        label="Modality"
        value={provision.modality}
      />
      <ReferenceList
        refs={provision.ref}
        pid={provision.id}
        getRefById={getRefById}
      />
    </>
  );
};

export const AddPageButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Button
      key="ui#button#addPageButton"
      icon="map-create"
      text=""
      onClick={() => callback()}
    />
  );
};
