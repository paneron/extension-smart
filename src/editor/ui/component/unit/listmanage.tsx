import React from 'react';
import { RefObject, useState } from 'react';
import { IList } from '../../interface/fieldinterface';

const ListManagerPane: React.FC<IList> = (content: IList) => {
  const selectbox: RefObject<HTMLSelectElement> = React.createRef();
  const [filter, setFilter] = useState('');

  const css: React.CSSProperties = {
    minWidth: '20%',
    maxWidth: '90%',
    minHeight: '50%',
  };

  const elms: Array<JSX.Element> = [];
  const smallfilter = filter.toLowerCase();
  for (const x of content.getItems()) {
    if (
      x.id.toLowerCase().indexOf(smallfilter) !== -1 ||
      x.text.toLowerCase().indexOf(smallfilter) !== -1
    ) {
      elms.push(
        <option key={'listmanage#' + x.id} value={x.reference}>
          {x.text}
        </option>
      );
    }
  }

  return (
    <>
      <p>
        {' '}
        {content.filterName}{' '}
        <input type="text" onChange={e => setFilter(e.target.value)} />{' '}
      </p>

      <p> {content.itemName} </p>
      <select style={css} ref={selectbox} multiple>
        {elms}
      </select>

      <p>
        <button onClick={() => content.addItemClicked()}>Add</button>
        <button onClick={() => content.removeItem(extractOptions(selectbox))}>
          Remove
        </button>
        <button
          onClick={() =>
            content.updateItem(
              selectbox.current === null ? '' : selectbox.current.value
            )
          }
        >
          Update
        </button>
      </p>
    </>
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

export default ListManagerPane;
