/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { RefObject, useState } from 'react';
import {
  mgd_input,
  mgd_label,
  mgd_select,
  mgd_select__restrained,
} from '../../../../css/form';
import { u__display__block, u__display__none } from '../../../../css/utility';
import MGDButton from '../../../MGDComponents/MGDButton';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import { IViewListInterface } from '../fields';

const ListViewPane: React.FC<IViewListInterface> = ({  
  filterName,
  itemName,
  getItems,
  removeItems,
  addClicked,
  updateClicked,
  size,
  buttons,
  isVisible
}) => {  
  const [filter, setFilter] = useState<string>('');
    
  const selectbox: RefObject<HTMLSelectElement> = React.createRef();
  const options = getItems(filter.toLocaleLowerCase());

  return (
    <div css={isVisible ? u__display__block : u__display__none}>
      <p>
        <label css={mgd_label}>{filterName}</label>
        <input
          css={mgd_input}
          type="text"
          onChange={e => setFilter(e.target.value)}
        />
      </p>

      <p> {itemName} </p>
      <select
        css={[mgd_select, mgd_select__restrained]}
        size={size}
        ref={selectbox}
        multiple
      >
        {options.map(value => (
          <option key={'listmanage#' + value.id} value={value.id}>
            {value.text === '' ? '( Untitled )' : value.text}
          </option>
        ))}
      </select>

      <MGDButtonGroup>
        <MGDButton icon="plus" onClick={() => addClicked()}>
          Add
        </MGDButton>
        <MGDButton
          icon="delete"
          onClick={() => removeItems(extractOptions(selectbox))}
        >
          Remove
        </MGDButton>
        <MGDButton
          icon="edit"
          onClick={() => actIfSelected(selectbox.current, updateClicked)}
        >
          Update
        </MGDButton>
        <>
          {buttons?.map((b, index) => (
            <MGDButton
              key={'ui#listview#additionbutton#' + index}
              icon={b.icon}
              onClick={() => actIfSelected(selectbox.current, b.onClick)}
            >
              {b.text}
            </MGDButton>
          ))}
        </>
      </MGDButtonGroup>
    </div>
  );    
}

function actIfSelected(
  elm: HTMLSelectElement | null,
  callback: (selected: string) => void
) {
  if (elm !== null && elm.selectedOptions.length > 0) {
    callback(elm.selectedOptions[0].value);
  }
}

function extractOptions(ref: React.RefObject<HTMLSelectElement>): string[] {
  if (ref.current !== null) {
    return Array.from(ref.current.selectedOptions, v => {
      return v.value;
    });
  }
  return [];
}

export default ListViewPane;
