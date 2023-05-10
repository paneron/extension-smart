/** @jsx jsx */

import { jsx } from '@emotion/react';
import {
  Button,
  FormGroup,
  HTMLSelect,
  IconName,
  NumericInput,
} from '@blueprintjs/core';
import React, { RefObject, useState } from 'react';
import { EditorModel } from '../../model/editormodel';
import MGDTextarea from '../../MGDComponents/MGDTextarea';
import {
  mgd_input,
  mgd_label,
  mgd_select,
  mgd_select__constrained,
} from '../../../css/form';
import {
  shame__mystery_container,
  shame__mystery_container__column,
} from '../../../css/shame';
import { MMELTable } from '../../serialize/interface/supportinterface';

export interface IAdditionalListButton {
  text: string;
  icon?: IconName;
  requireSelected?: boolean;
  onClick: (id: string) => void;
}

export interface IField {
  text?: string;
  value: string;
  onChange?: (x: string) => void;
  extend?: JSX.Element;
  rows?: number;
}

export interface INumField {
  text?: string;
  value: number;
  onChange?: (x: number) => void;
  extend?: JSX.Element;
}

export interface IComboField {
  text?: string;
  options: readonly string[];
  value: string;
  onChange: (x: string) => void;
  extend?: JSX.Element;
  noContainer?: boolean;
  fill?: boolean;
}

export interface IMultiRefSelectField {
  filterName: string;
  text: string;
  options: string[];
  values: Set<string>;
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

export interface IManageHandler<T> {
  filterName: string;
  itemName: string;
  Content: React.FC<{
    object: T;
    model?: EditorModel;
    setObject: (obj: T) => void;
    oldid: string;
  }>;
  initObj: T;
  model?: EditorModel;
  getItems: (filter: string) => IListItem[];
  removeItems: (ids: string[]) => void;
  moveUp?: (id: string) => void;
  moveDown?: (id: string) => void;
  addItem: (obj: T) => boolean;
  updateItem: (oldid: string, obj: T) => boolean;
  getObjById: (id: string) => T;
  buttons?: IAdditionalListButton[];
}

export interface IViewListInterface {
  isVisible: boolean;
  filterName: string;
  itemName: string;
  getItems: (filter: string) => IListItem[];
  removeItems?: (ids: string[]) => void;
  moveUp?: (x: string) => void;
  moveDown?: (x: string) => void;
  addClicked?: () => void;
  updateClicked?: (selected: string) => void;
  size: number;
  requireDefaultButtons?: boolean;
  buttons?: IAdditionalListButton[];
}

export interface IListItem {
  id: string;
  text: string;
}

export interface IUpdateInterface<T> {
  isVisible: boolean;
  Content: React.FC<{
    object: T;
    setObject: (obj: T) => void;
    model?: EditorModel;
    table?: MMELTable;
    oldid: string;
  }>;
  object: T;
  setObject: (obj: T) => void;
  model?: EditorModel;
  table?: MMELTable;
  oldid: string;
  updateButtonLabel: string;
  updateButtonIcon: IconName;
  updateClicked: () => void;
  cancelClicked: () => void;
}

export const NumberTextField: React.FC<INumField> = f => {
  return (
    <FormGroup label={f.text} helperText={f.extend}>
      <NumericInput
        readOnly={f.onChange === undefined}
        onValueChange={x => {
          if (f.onChange) {
            f.onChange(x);
          }
        }}
        value={f.value}
        fill
      />
    </FormGroup>
  );
};

export const NormalTextField: React.FC<IField> = f => {
  return (
    <FormGroup label={f.text} helperText={f.extend}>
      <MGDTextarea
        readOnly={f.onChange === undefined}
        onChange={e => {
          if (f.onChange) {
            f.onChange(e.target.value);
          }
        }}
        rows={f.rows}
        value={f.value}
        fill
      />
    </FormGroup>
  );
};

export const NumericComboBox: React.FC<{
  options: number[];
  value: number;
  onChange: (x: number) => void;
}> = function ({ options, value, onChange }) {
  return (
    <select
      css={mgd_select}
      value={value}
      onChange={e => onChange(parseInt(e.target.value))}
    >
      {options.map((x, index) => (
        <option key={'option' + index} value={x}>
          {x}
        </option>
      ))}
    </select>
  );
};

export const NormalComboBox: React.FC<IComboField> = function ({
  text,
  options,
  value,
  onChange,
  extend,
  noContainer = false,
  fill,
}) {
  const content = (
    <HTMLSelect
      className="bp3-html-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      fill={fill}
    >
      {options.map((x, index) => (
        <option key={`option-${jsx.length}` + index} value={x}>
          {x}
        </option>
      ))}
    </HTMLSelect>
  );
  return noContainer ? (
    content
  ) : (
    <FormGroup label={text} helperText={extend}>
      {content}
    </FormGroup>
  );
};

export const DataTimeTextField: React.FC<IField> = (f: IField) => {
  return (
    <FormGroup label={f.text} helperText={f.extend}>
      <input
        type="datetime-local"
        readOnly={f.onChange === undefined}
        onChange={e => {
          if (f.onChange) {
            f.onChange(e.target.value);
          }
        }}
        value={f.value}
      />
    </FormGroup>
  );
};

export const MultiReferenceSelector: React.FC<IMultiRefSelectField> = (
  f: IMultiRefSelectField
) => {
  const mainlist: RefObject<HTMLSelectElement> = React.createRef();
  const reflist: RefObject<HTMLSelectElement> = React.createRef();

  const [filter, setFilter] = useState('');

  const smallfilter = filter.toLowerCase();
  const elms: string[] = [];
  const options: string[] = [];

  for (const x of f.values) {
    if (x.toLowerCase().includes(smallfilter)) {
      elms.push(x);
    }
  }
  for (const x of f.options) {
    if (x.toLowerCase().includes(smallfilter) && !f.values.has(x)) {
      options.push(x);
    }
  }

  return (
    <fieldset>
      <legend>{f.text}</legend>
      <div css={shame__mystery_container}>
        <div css={shame__mystery_container__column}>
          {f.text}
          <select
            css={[mgd_select, mgd_select__constrained]}
            ref={mainlist}
            multiple
          >
            {elms.map((x, index) => (
              <option key={'ui#selector#values#' + index} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
        <div css={shame__mystery_container__column}>
          <Button
            icon="chevron-left"
            onClick={() => f.add(extractOptions(reflist))}
          >
            Add
          </Button>
          <Button
            rightIcon="chevron-right"
            onClick={() => f.remove(extractOptions(mainlist))}
          >
            Remove
          </Button>
        </div>
        <div css={shame__mystery_container__column}>
          <div>
            <label css={mgd_label}> {f.filterName} </label>
            <input
              css={mgd_input}
              type="text"
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <select
            css={[mgd_select, mgd_select__constrained]}
            ref={reflist}
            multiple
          >
            {options.map((x, index) => (
              <option key={'ui#selector#options#' + index} value={x}>
                {x}
              </option>
            ))}
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

  const options: [string, number][] = [];
  f.options.forEach((x, index) => {
    if (x.toLowerCase().includes(smallfilter) && x !== f.value) {
      if (x === '') {
        options.push(['(Empty - not specified)', index]);
      } else {
        options.push([x, index]);
      }
    }
  });

  function handleOnClick() {
    const selected = extractOption(optionlist);
    if (selected !== null && selected !== -1) {
      f.update(selected);
    }
  }

  return (
    <fieldset>
      <legend>{f.text}</legend>
      <div css={shame__mystery_container}>
        <label css={mgd_label}>{f.text}</label>
        <MGDTextarea
          id="field#text"
          value={f.value}
          readOnly={f.editable !== undefined && !f.editable}
          onChange={e => {
            if (f.onChange !== undefined) {
              f.onChange(e.target.value);
            }
          }}
          rows={1}
        />
        <Button icon="double-chevron-left" onClick={() => handleOnClick()}>
          Select
        </Button>
        <div css={shame__mystery_container__column}>
          <div>
            <label css={mgd_label}>{f.filterName}</label>
            <input
              css={mgd_input}
              type="text"
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <select
            css={[mgd_select, mgd_select__constrained]}
            ref={optionlist}
            multiple
          >
            {options.map(([x, index]) => (
              <option key={'ui#selector#options#' + index} value={index}>
                {x}
              </option>
            ))}
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
