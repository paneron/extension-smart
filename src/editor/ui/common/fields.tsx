/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { FormGroup, TextArea } from '@blueprintjs/core';
import React from 'react';
import { MMELObject } from '../../serialize/interface/baseinterface';

export interface IField {
  text: string;
  value: string;
  update: (x: string) => void;
  extend?: JSX.Element;
}

export type IManageHandler = {
  filterName: string;
  itemName: string;
  Content: React.FC<{
    object: MMELObject;
    setObject: (obj: MMELObject) => void;
  }>;
  initObj: MMELObject;
  getItems: (filter: string) => IListItem[];
  removeItems: (ids: Array<string>) => void;
  addItem: (obj: MMELObject) => boolean;
  updateItem: (oldid: string, obj: MMELObject) => boolean;
  getObjById: (id: string) => MMELObject;
};

export interface IViewListInterface {
  filterName: string;
  itemName: string;
  getItems: (filter: string) => IListItem[];
  removeItems: (ids: Array<string>) => void;
  addClicked: () => void;
  updateClicked: (selected: string) => void;
}

export interface IListItem {
  id: string;
  text: string;
}

export interface IUpdateInterface {
  Content: React.FC<{
    object: MMELObject;
    setObject: (obj: MMELObject) => void;
  }>;
  object: MMELObject;
  setObject: (obj: MMELObject) => void;
  updateButtonLabel: string;
  updateClicked: () => void;
  cancelClicked: () => void;
}

export const NormalTextField: React.FC<IField> = (f: IField) => {
  return (
    <FormGroup label={f.text} helperText={f.extend}>
      <TextArea
        onChange={e => f.update(e.target.value)}
        value={f.value}
        css={css`
          padding: 5px !important;
        `}
        fill
      />
    </FormGroup>
  );
};

export const NormalButton: React.FC<{
  key: string;
  text: string;
  onClick: () => void;
}> = ({ key, text, onClick }) => {
  return (
    <button key={key} onClick={() => onClick()}>
      {text}
    </button>
  );
};
