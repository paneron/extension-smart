/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  BASICTYPES,
  BooleanOptions,
  BOOLEANTYPE,
  DATETIMETYPE,
  EMPTYTYPE,
  ROLETYPE,
  STRINGTYPE,
} from '../../utils/constants';
import {
  DataTimeTextField,
  NormalComboBox,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';

const StringFieldEdit: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
}> = function ({ value, title, onChange }) {
  return <NormalTextField text={title} value={value} onChange={onChange} />;
};

const BooleanFieldEdit: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
}> = function ({ value, title, onChange }) {
  return (
    <NormalComboBox
      text={title}
      value={value}
      options={BooleanOptions}
      onChange={onChange}
    />
  );
};

const DateTimeFieldEdit: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
}> = function ({ value, title, onChange }) {
  return <DataTimeTextField text={title} value={value} onChange={onChange} />;
};

const RoleFieldEdit: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
  roles: string[];
}> = function ({ value, title, onChange, roles }) {
  return (
    <ReferenceSelector
      text={title}
      filterName="Role filter"
      value={value}
      options={roles}
      update={x => onChange(roles[x])}
    />
  );
};

const AttributeEditors: Record<
  BASICTYPES,
  React.FC<{
    value: string;
    title: string;
    onChange: (x: string) => void;
    roles: string[];
  }>
> = {
  [EMPTYTYPE]: StringFieldEdit,
  [STRINGTYPE]: StringFieldEdit,
  [BOOLEANTYPE]: BooleanFieldEdit,
  [DATETIMETYPE]: DateTimeFieldEdit,
  [ROLETYPE]: RoleFieldEdit,
};

const BasicTypeAttribute: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
  type: BASICTYPES;
  roles: string[];
}> = function ({ value, title, onChange, type, roles }) {
  const Attribute = AttributeEditors[type];
  return (
    <Attribute value={value} title={title} onChange={onChange} roles={roles} />
  );
};

export default BasicTypeAttribute;
