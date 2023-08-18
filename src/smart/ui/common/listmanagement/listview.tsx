/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import type { RefObject } from 'react';
import { useState } from 'react';
import {
  mgd_input,
  mgd_label,
  mgd_select,
  mgd_select__restrained,
} from '@/css/form';
import { u__display__block, u__display__none } from '@/css/utility';
import MGDButtonGroup from '@/smart/MGDComponents/MGDButtonGroup';
import type { IViewListInterface } from '@/smart/ui/common/fields';

const ListViewPane: React.FC<IViewListInterface> = ({
  filterName,
  itemName,
  getItems,
  removeItems,
  addClicked,
  updateClicked,
  size,
  buttons,
  isVisible,
  moveUp,
  moveDown,
}) => {
  const [filter, setFilter] = useState<string>('');

  const selectbox: RefObject<HTMLSelectElement> = React.createRef();
  const options = getItems(filter.toLocaleLowerCase());

  function checkMoveUp(x: string) {
    moveUp!(x);
    const index = parseInt(x);
    if (index > 0) {
      selectbox.current!.selectedIndex = index - 1;
    }
  }

  function checkMoveDown(x: string) {
    moveDown!(x);
    const index = parseInt(x);
    if (index < options.length - 1) {
      selectbox.current!.selectedIndex = index + 1;
    }
  }

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
      <div style={{ display : 'flex' }}>
        <div style={{ flexGrow : 1 }}>
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
        </div>
        {moveUp && moveDown && (
          <div
            style={{
              display        : 'flex',
              flexDirection  : 'column',
              justifyContent : 'center',
              gap            : 20,
            }}
          >
            <Button
              icon="symbol-triangle-up"
              onClick={() => actIfSelected(selectbox.current, checkMoveUp)}
            />
            <Button
              icon="symbol-triangle-down"
              onClick={() => actIfSelected(selectbox.current, checkMoveDown)}
            />
          </div>
        )}
      </div>

      <MGDButtonGroup>
        {addClicked !== undefined ? (
          <Button icon="plus" onClick={() => addClicked()}>
            Add
          </Button>
        ) : (
          <></>
        )}
        {removeItems !== undefined ? (
          <Button
            icon="delete"
            onClick={() => removeItems(extractOptions(selectbox))}
          >
            Remove
          </Button>
        ) : (
          <></>
        )}
        {updateClicked !== undefined ? (
          <Button
            icon="edit"
            onClick={() => actIfSelected(selectbox.current, updateClicked)}
          >
            Update
          </Button>
        ) : (
          <></>
        )}
        <>
          {buttons?.map((b, index) => (
            <Button
              key={`ui#listview#additionbutton#${jsx.length}` + index}
              icon={b.icon}
              onClick={() =>
                b.requireSelected === undefined || b.requireSelected
                  ? actIfSelected(selectbox.current, b.onClick)
                  : b.onClick('')
              }
            >
              {b.text}
            </Button>
          ))}
        </>
      </MGDButtonGroup>
    </div>
  );
};

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
