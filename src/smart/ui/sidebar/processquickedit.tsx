/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
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
import { NodeCallBack } from '../../model/FlowContainer';
import MGDButtonGroup from '../../MGDComponents/MGDButtonGroup';
import MGDButton from '../../MGDComponents/MGDButton';
import { Tooltip2 } from '@blueprintjs/popover2';
import { EditButton, RemoveButton } from '../common/buttons';
import { ActorDescription, DescriptionItem } from '../common/description/fields';
import { ProvisionList } from '../common/description/ComponentList';

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
            onClick={() =>
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
            onClick={() =>
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

export const AddSubprocessButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Tooltip2 content="Add subprocess">
      <MGDButton icon="map-create" onClick={() => callback()} />;
    </Tooltip2>
  );
};
