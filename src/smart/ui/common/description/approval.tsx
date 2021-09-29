/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import { EditorApproval, EditorRegistry } from '../../../model/editormodel';
import { DataType } from '../../../serialize/interface/baseinterface';
import {
  MMELReference,
  MMELRole,
} from '../../../serialize/interface/supportinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../../utils/constants';
import { EditButton, RemoveButton } from '../buttons';
import { ApprovalRecordList, ReferenceList } from './ComponentList';
import {
  ActorDescription,
  DescriptionItem,
  NonEmptyFieldDescription,
} from './fields';

export const DescribeApproval: React.FC<{
  app: EditorApproval;
  getRoleById: (id: string) => MMELRole | null;
  getRefById?: (id: string) => MMELReference | null;
  getRegistryById?: (id: string) => EditorRegistry | null;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ app, getRoleById, getRefById, getRegistryById, setDialog }) {
  const regs: EditorRegistry[] = [];
  if (getRegistryById !== undefined) {
    app.records.forEach(r => {
      const ret = getRegistryById(r);
      if (ret !== null) {
        regs.push(ret);
      }
    });
  }
  return (
    <>
      {setDialog !== undefined && (
        <MGDButtonGroup>
          <EditButton
            onClick={() =>
              setDialog(DataType.APPROVAL, EditAction.EDIT, app.id)
            }
          />
          <RemoveButton
            onClick={() =>
              setDialog(DataType.APPROVAL, EditAction.DELETE, app.id)
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Approval" value={app.id} />
      <DescriptionItem label="Name" value={app.name} />
      <ActorDescription role={getRoleById(app.actor)} label="Actor" />
      <ActorDescription role={getRoleById(app.approver)} label="Approver" />
      <NonEmptyFieldDescription label="Modality" value={app.modality} />
      <ApprovalRecordList regs={regs} />
      {getRefById !== undefined && (
        <ReferenceList refs={app.ref} getRefById={getRefById} />
      )}
    </>
  );
};
