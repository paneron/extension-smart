import React from 'react';
import { mgdLabel } from '../../../../css/form';
import { HistoryAction } from '../../../model/editor/history';
import { HistoryItem } from '../../../model/history';
import { MMELRole } from '../../../serialize/interface/supportinterface';

type Breadcrumb = {
  label: JSX.Element;
  onNavigate: () => void;
};

export const DescriptionItem: React.FC<{
  label?: string;
  value: string;
  extend?: JSX.Element;
}> = function ({ label, value, extend }): JSX.Element {
  return (
    <p>
      <label style={mgdLabel}>
        {label === undefined ? value : `${label}: ${value}`}
      </label>
      {extend}
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

export function getBreadcrumbs(
  ph: HistoryItem[],
  onPageChange: (updated: HistoryAction, newPage: string) => void
): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = ph.map((item, index) => ({
    label      : <>{item.pathtext}</>,
    onNavigate : () => {
      const page = ph[index].page;
      const action: HistoryAction = {
        type  : 'history',
        act   : 'pop',
        value : ph.length - index - 1,
      };
      onPageChange(action, page);
    },
  }));
  return breadcrumbs;
}
