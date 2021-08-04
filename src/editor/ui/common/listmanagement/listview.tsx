/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { RefObject, useState } from 'react';
import { IViewListInterface, NormalButton } from '../fields';

const ListManagerPane: React.FC<IViewListInterface> = ({
  filterName,
  itemName,
  getItems,
  removeItems,
  addClicked,
  updateClicked,
}) => {
  const selectbox: RefObject<HTMLSelectElement> = React.createRef();
  const [filter, setFilter] = useState<string>('');

  const css: React.CSSProperties = {
    minWidth: '20%',
    maxWidth: '90%',
  };

  const options = getItems(filter);

  return (
    <>
      <p>
        {' '}
        {filterName}
        <input type="text" onChange={e => setFilter(e.target.value)} />{' '}
      </p>

      <p> {itemName} </p>
      <select style={css} size={15} ref={selectbox} multiple>
        {options.map(value => (
          <option key={'listmanage#' + value.id} value={value.id}>
            {value.text}
          </option>
        ))}
      </select>

      <p>
        <NormalButton
          key="ui#listview#addbutton"
          text="Add"
          onClick={() => addClicked()}
        />
        <NormalButton
          key="ui#listview#removebutton"
          text="Remove"
          onClick={() => {
            removeItems(extractOptions(selectbox));
          }}
        />
        <NormalButton
          key="ui#listview#updatebutton"
          text="Update"
          onClick={() => {
            if (selectbox.current !== null) {
              updateClicked(selectbox.current.value);
            }
          }}
        />
      </p>
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

export default ListManagerPane;
