/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ButtonGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { RefObject, useState } from 'react';
import { IViewListInterface } from '../fields';

const ListViewPane: React.FC<IViewListInterface> = ({
  filterName,
  itemName,
  getItems,
  removeItems,
  addClicked,
  updateClicked,
  size,
}) => {
  const selectbox: RefObject<HTMLSelectElement> = React.createRef();
  const [filter, setFilter] = useState<string>('');

  const options = getItems(filter);

  return (
    <>
      <p>
        {' '}
        {filterName}
        <input type="text" onChange={e => setFilter(e.target.value)} />{' '}
      </p>

      <p> {itemName} </p>
      <select
        style={{
          minWidth: '100%',
          maxWidth: '100% !important',
          width: '100%',
        }}
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

      <ButtonGroup>
        <Button
          key="ui#listview#addbutton"
          icon="plus"
          text="Add"
          onClick={() => addClicked()}
        />
        <Button
          key="ui#listview#removebutton"
          icon="delete"
          text="Remove"
          onClick={() => removeItems(extractOptions(selectbox))}
        />
        <Button
          key="ui#listview#updatebutton"
          icon="edit"
          text="Update"
          onClick={() => {
            if (
              selectbox.current !== null &&
              selectbox.current.selectedOptions.length > 0
            ) {
              updateClicked(selectbox.current.selectedOptions[0].value);
            }
          }}
        />
      </ButtonGroup>
    </>
  );
};

function extractOptions(ref: React.RefObject<HTMLSelectElement>): string[] {
  if (ref.current !== null) {
    return Array.from(ref.current.selectedOptions, v => {
      return v.value;
    });
  }
  return [];
}

export default ListViewPane;
