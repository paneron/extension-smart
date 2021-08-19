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
  MMELRole,
} from '../../serialize/interface/supportinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
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
    getRoleById: (id: string) => MMELRole | null;
    getRefById: (id: string) => MMELReference | null;
    getProvisionById: (id: string) => MMELProvision | null;
    setDialog: (
      nodeType: EditableNodeTypes | DeletableNodeTypes,
      action: EditAction,
      id: string,
      resetSelection: () => void
    ) => void;
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
            <AddSubprocessButton callback={() => onSubprocessClick(process.id)} />
          )}
          <RemoveButton
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
        label="Process"
        value={process.id}
      />
      <DescriptionItem
        label="Name"
        value={process.name}
      />
      <ActorDescription
        role={getRoleById(process.actor)}
        label="Actor"
      />
      <ProvisionList
        provisions={process.provision}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
      />
    </>
  );
};

const ProvisionList: React.FC<{
  provisions: Set<string>;
  getProvisionById: (id: string) => MMELProvision | null;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ provisions, getProvisionById, getRefById }) {
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
          <p>Provisions</p>
          <ul>
            {pros.map((provision: MMELProvision) => (
              <li key={provision.id}>
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
        label="Statement"
        value={provision.condition}
      />
      <NonEmptyFieldDescription
        label="Modality"
        value={provision.modality}
      />
      <ReferenceList
        refs={provision.ref}
        getRefById={getRefById}
      />
    </>
  );
};

export const AddSubprocessButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Button small onClick={() => callback()}>
      Add subprocess
    </Button>
  );
};
