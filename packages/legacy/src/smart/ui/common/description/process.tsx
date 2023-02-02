import React from 'react';
import { EditorProcess } from '../../../model/editormodel';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
} from '@paneron/libmmel/interface/supportinterface';
import { ActorDescription, DescriptionItem } from './fields';
import { MeasurementList, NotesList, ProvisionList } from './ComponentList';

export const DescribeProcess: React.FC<{
  process: EditorProcess;
  getRoleById: (id: string) => MMELRole | null;
  getRefById?: (id: string) => MMELReference | null;
  getProvisionById: (id: string) => MMELProvision | null;
  getNoteById: (id: string) => MMELNote | null;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
}> = ({
  process,
  getProvisionById,
  getRefById,
  getRoleById,
  getNoteById,
  CustomProvision,
}) => {
  return (
    <>
      <DescriptionItem label="Process" value={process.id} />
      <DescriptionItem label="Name" value={process.name} />
      <ActorDescription role={getRoleById(process.actor)} label="Actor" />
      <ProvisionList
        provisions={process.provision}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
        CustomProvision={CustomProvision}
      />
      <NotesList
        notes={process.notes}
        getNoteById={getNoteById}
        getRefById={getRefById}
      />
      <MeasurementList measurements={process.measure} />
    </>
  );
};
