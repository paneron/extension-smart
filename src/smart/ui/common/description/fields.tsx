import React from 'react';
import { mgdLabel } from '../../../../css/form';
import { MMELRole } from '../../../serialize/interface/supportinterface';

export const DescriptionItem: React.FC<{
  label?: string;
  value: string;
}> = function ({ label, value }): JSX.Element {
  return (
    <p>
      <label style={mgdLabel}>
        {label === undefined ? value : `${label}: ${value}`}
      </label>
    </p>
  );
};

export const ActorDescription: React.FC<{
  role: MMELRole | null;
  label: string;
}> = function ({ role, label }): JSX.Element {
  return (
    <>
      {role !== null ? (
        <DescriptionItem label={label} value={role.name} />
      ) : (
        <></>
      )}
    </>
  );
};

export const NonEmptyFieldDescription: React.FC<{
  label: string;
  value: string;
}> = function ({ label, value }): JSX.Element {
  return (
    <>{value !== '' ? <DescriptionItem label={label} value={value} /> : ''}</>
  );
};
