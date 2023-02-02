import { Checkbox } from '@blueprintjs/core';
import React from 'react';
import { mgdLabel } from '../../../css/form';
import { ChecklistPackage, getCheckListId } from '../../model/checklist';
import { MMELDataAttribute } from '@paneron/libmmel/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
} from '@paneron/libmmel/interface/supportinterface';
import { DescribeProvision } from '../common/description/ComponentDescription';
import { DescribeAttribute } from '../common/description/data';
import ChecklistAttribute from './AttributeField';
import ChecklistProvision from './ProvisionField';

export const CustomCLAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById?: (id: string) => MMELReference | null;
  data: unknown;
  dcid: string;
}> = function (props) {
  const { att, data, dcid } = props;

  const pack = data as ChecklistPackage;
  const { onProgressChange } = pack.callback;
  const result = pack.result;
  const aid = getCheckListId(att, dcid);
  const item = result !== undefined ? result.checklist[aid] : undefined;
  return item !== undefined ? (
    <ChecklistAttribute
      {...props}
      progress={item.progress}
      onProgressChange={x => onProgressChange(aid, x)}
    />
  ) : (
    <DescribeAttribute {...props} />
  );
};

export const CustomCLProvision: React.FC<{
  provision: MMELProvision;
  getRefById?: (id: string) => MMELReference | null;
  data: unknown;
}> = function (props) {
  const { provision, data } = props;
  const pack = data as ChecklistPackage;
  const { onProgressChange } = pack.callback;
  const result = pack.result;
  const proid = getCheckListId(provision);
  const item = result !== undefined ? result.checklist[proid] : undefined;
  const progress = item !== undefined ? item.progress : 0;
  return item !== undefined ? (
    <ChecklistProvision
      {...props}
      progress={progress}
      onProgressChange={x => onProgressChange(proid, x)}
    />
  ) : (
    <DescribeProvision {...props} />
  );
};

export const CLDescriptionItem: React.FC<{
  label?: string;
  value: string;
  progress: number;
  onChange: () => void;
  children?: React.ReactNode;
}> = function ({ label, value, progress, onChange, children }): JSX.Element {
  return (
    <p>
      <Checkbox checked={progress === 100} onChange={onChange}>
        <label style={mgdLabel}>
          {label === undefined ? value : `${label}: ${value}`}
          {children}
        </label>
      </Checkbox>
    </p>
  );
};
