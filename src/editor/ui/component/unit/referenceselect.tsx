import React, { CSSProperties, useState } from 'react';
import { RefObject } from 'react';
import {
  IMultiRefSelectField,
  IRefSelectField,
} from '../../interface/fieldinterface';

const list: CSSProperties = {
  minWidth: '100px',
  minHeight: '200px',
};

const containercss: CSSProperties = {
  overflow: 'hidden',
  border: '1px solid black',
  width: '90%',
  display: 'flex',
  flexFlow: 'row wrap',
  alignItems: 'center',
};

const column: CSSProperties = {
  textAlign: 'center',
  display: 'flex',
  flexFlow: 'column nowrap',
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
    <div style={containercss}>
      <div style={column}>
        {f.text}
        <select style={list} ref={mainlist} multiple>
          {' '}
          {elms}{' '}
        </select>
      </div>
      <button onClick={() => f.add(extractOptions(reflist))}> &lt;- Add</button>
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
  );
};

export const ReferenceSelector: React.FC<IRefSelectField> = (
  f: IRefSelectField
) => {
  const optionlist: RefObject<HTMLSelectElement> = React.createRef();

  const [filter, setFilter] = useState('');

  const smallfilter = filter.toLowerCase();
  const options: Array<JSX.Element> = [];
  f.options.map((x, index) => {
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
      <button onClick={() => f.update(extractOption(optionlist))}>
        {' '}
        &lt;- Select{' '}
      </button>
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
  );
};

function extractOptions(
  ref: React.RefObject<HTMLSelectElement>
): Array<string> {
  if (ref.current !== null) {
    return Array.from(ref.current.selectedOptions, v => {
      return v.value;
    });
  }
  return [];
}

function extractOption(ref: React.RefObject<HTMLSelectElement>): number {
  if (ref.current !== null) {
    return parseInt(ref.current.value);
  }
  return -1;
}

const inputcss: CSSProperties = {
  resize: 'both',
  height: '18px',
  verticalAlign: 'middle',
};
