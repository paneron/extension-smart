/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { EditorProcess } from '../../../model/editormodel';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../../serialize/interface/supportinterface';
import { ActorDescription, DescriptionItem } from './fields';
import { MeasurementList, ProvisionList } from './ComponentList';

export const DescribeProcess: React.FC<{
  process: EditorProcess;
  getRoleById: (id: string) => MMELRole | null;
  getRefById?: (id: string) => MMELReference | null;
  getProvisionById: (id: string) => MMELProvision | null;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
}> = ({
  process,
  getProvisionById,
  getRefById,
  getRoleById,
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
      <MeasurementList measurements={process.measure} />
    </>
  );
};
