import React from 'react';
import { EditorApproval, EditorRegistry } from '../../../model/editormodel';
import {
  MMELReference,
  MMELRole,
} from '@paneron/libmmel/interface/supportinterface';
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
}> = function ({ app, getRoleById, getRefById, getRegistryById }) {
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
