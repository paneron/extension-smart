/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { FormGroup, IconName, TextArea } from '@blueprintjs/core';
import React, { CSSProperties, RefObject, useState } from 'react';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { EditorModel } from '../../model/editormodel';

export interface IField {
  text: string;
  value: string;
  onChange: (x: string) => void;
  extend?: JSX.Element;
}

export interface IComboField {
  text: string;
  options: Array<string>;
  value: string;
  onChange: (x: string) => void;
  extend?: JSX.Element;
}

export interface IMultiRefSelectField {
  filterName: string;
  text: string;
  options: string[];
  values: string[];
  add: (x: Set<string>) => void;
  remove: (x: Set<string>) => void;
}

export interface IRefSelectField {
  filterName: string;
  text: string;
  options: string[];
  value: string;
  editable?: boolean;
  onChange?: (x: string) => void;
  update: (x: number) => void;
}

export type IManageHandler = {
  filterName: string;
  itemName: string;
  Content: React.FC<{
    object: MMELObject;
    model: EditorModel;
    setObject: (obj: MMELObject) => void;
  }>;
  initObj: MMELObject;
  model: EditorModel;
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
  size: number;
}

export interface IListItem {
  id: string;
  text: string;
}

export interface IUpdateInterface {
  Content: React.FC<{
    object: MMELObject;
    model: EditorModel;
    setObject: (obj: MMELObject) => void;
  }>;
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
  updateButtonLabel: string;
  updateButtonIcon: IconName;
  updateClicked: () => void;
  cancelClicked: () => void;
}

export const NormalTextField: React.FC<IField> = (f: IField) => {
  return (
    <FormGroup label={f.text} helperText={f.extend}>
      <TextArea
        onChange={e => f.onChange(e.target.value)}
        value={f.value}
        css={css`
          padding: 5px !important;
        `}
        fill
      />
    </FormGroup>
  );
};

export const NormalComboBox: React.FC<IComboField> = function ({
  text,
  options,
  value,
  onChange,
  extend,
}) {
  return (
    <FormGroup label={text} helperText={extend}>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map((x, index) => (
          <option key={'option' + index} value={x}>
            {x}
          </option>
        ))}
      </select>
    </FormGroup>
  );
};

const list: CSSProperties = {
  minWidth: '100px',
  minHeight: '200px',
};

const containercss: CSSProperties = {
  overflow: 'hidden',
  display: 'flex',
  flexFlow: 'row wrap',
  alignItems: 'center',
};

const column: CSSProperties = {
  textAlign: 'center',
  display: 'flex',
  flexFlow: 'column nowrap',
};

const inputcss: CSSProperties = {
  resize: 'both',
  height: '18px',
  verticalAlign: 'middle',
};

export const MultiReferenceSelector: React.FC<IMultiRefSelectField> = (
  f: IMultiRefSelectField
) => {
  const mainlist: RefObject<HTMLSelectElement> = React.createRef();
  const reflist: RefObject<HTMLSelectElement> = React.createRef();

  const [filter, setFilter] = useState('');

  const elms: Array<JSX.Element> = [];
  const smallfilter = filter.toLowerCase();
  for (const x of f.values) {
    if (x.toLowerCase().indexOf(smallfilter) !== -1) {
      elms.push(
        <option key={'ui#selector#values#' + x} value={x}>
          {x}
        </option>
      );
    }
  }
  const options: Array<JSX.Element> = [];
  for (const x of f.options) {
    if (
      x.toLowerCase().indexOf(smallfilter) !== -1 &&
      f.values.indexOf(x) === -1
    ) {
      options.push(
        <option key={'ui#selector#options#' + x} value={x}>
          {x}
        </option>
      );
    }
  }

  return (
    <fieldset>
      <legend>{f.text}</legend>
      <div style={containercss}>
        <div style={column}>
          {f.text}
          <select style={list} ref={mainlist} multiple>
            {' '}
            {elms}{' '}
          </select>
        </div>
        <button onClick={() => f.add(extractOptions(reflist))}>
          {' '}
          &lt;- Add
        </button>
        <button onClick={() => f.remove(extractOptions(mainlist))}>
          Remove -&gt;{' '}
        </button>
        <div style={column}>
          <div>
            {' '}
            {f.filterName}{' '}
            <input type="text" onChange={e => setFilter(e.target.value)} />{' '}
          </div>
          <select style={list} ref={reflist} multiple>
            {options}
          </select>
        </div>
      </div>
    </fieldset>
  );
};

export const ReferenceSelector: React.FC<IRefSelectField> = (
  f: IRefSelectField
) => {
  const optionlist: RefObject<HTMLSelectElement> = React.createRef();

  const [filter, setFilter] = useState('');

  const smallfilter = filter.toLowerCase();
  const options: Array<JSX.Element> = [];

  function handleOnClick() {
    const selected = extractOption(optionlist);
    if (selected !== null && selected !== -1) {
      f.update(selected);
    }
  }

  f.options.forEach((x, index) => {
    if (x.toLowerCase().indexOf(smallfilter) !== -1 && x !== f.value) {
      if (x === '') {
        options.push(
          <option key={'ui#selector#options#empty'} value={0}>
            (Empty - not specified)
          </option>
        );
      } else {
        options.push(
          <option key={'ui#selector#options#' + x} value={index}>
            {x}
          </option>
        );
      }
    }
  });
  return (
    <fieldset>
      <legend>{f.text}</legend>
      <div style={containercss}>
        {f.text}
        <textarea
          style={inputcss}
          value={f.value}
          readOnly={f.editable !== undefined && !f.editable}
          onChange={e => {
            if (f.onChange !== undefined) {
              f.onChange(e.target.value);
            }
          }}
        />
        <button onClick={() => handleOnClick()}> &lt;- Select </button>
        <div style={column}>
          <div>
            {' '}
            {f.filterName}{' '}
            <input type="text" onChange={e => setFilter(e.target.value)} />{' '}
          </div>
          <select style={list} ref={optionlist} multiple>
            {' '}
            {options}{' '}
          </select>
        </div>
      </div>
    </fieldset>
  );
};

function extractOptions(ref: React.RefObject<HTMLSelectElement>): Set<string> {
  if (ref.current !== null) {
    return new Set(
      Array.from(ref.current.selectedOptions, v => {
        return v.value;
      })
    );
  }
  return new Set<string>();
}

function extractOption(ref: React.RefObject<HTMLSelectElement>): number {
  if (ref.current !== null && ref.current.value !== '') {
    return parseInt(ref.current.value);
  }
  return -1;
}
