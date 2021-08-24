/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
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
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import MGDButton from '../../MGDComponents/MGDButton';

export const ProcessQuickEdit: React.FC<
  NodeCallBack & {
    process: EditorProcess;
    onSubprocessClick: (pid: string) => void;
    getRoleById: (id: string) => MMELRole | null;
    getRefById: (id: string) => MMELReference | null;
    getProvisionById: (id: string) => MMELProvision | null;
    setDialog: (
      nodeType: EditableNodeTypes | DeletableNodeTypes,
      action: EditAction,
      id: string
    ) => void;
  }
> = ({
  process,
  modelType,
  getProvisionById,
  getRefById,
  getRoleById,
  setDialog,
  onSubprocessClick,
}) => {
  return (
    <>
      {modelType === ModelType.EDIT && (
        <MGDButtonGroup>
          <EditButton
            callback={() =>
              setDialog(DataType.PROCESS, EditAction.EDIT, process.id)
            }
          />
          {process.page === '' ? (
            <AddSubprocessButton
              callback={() => onSubprocessClick(process.id)}
            />
          ) : (
            <></>
          )}
          <RemoveButton
            callback={() =>
              setDialog(DataType.PROCESS, EditAction.DELETE, process.id)
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Process" value={process.id} />
      <DescriptionItem label="Name" value={process.name} />
      <ActorDescription role={getRoleById(process.actor)} label="Actor" />
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
                <DescribeProvision
                  provision={provision}
                  getRefById={getRefById}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
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
      <DescriptionItem label="Statement" value={provision.condition} />
      <NonEmptyFieldDescription label="Modality" value={provision.modality} />
      <ReferenceList refs={provision.ref} getRefById={getRefById} />
    </>
  );
};

export const AddSubprocessButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return <MGDButton onClick={() => callback()}>Add subprocess</MGDButton>;
};
