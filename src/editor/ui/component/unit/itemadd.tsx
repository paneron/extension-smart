/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { IAddItem } from '../../interface/fieldinterface';

const ItemAddPane: React.FC<IAddItem> = (content: IAddItem) => {
  const elms: Array<JSX.Element> = content.getAddFields();
  return (
    <>
      {elms}
      <button key="ui#itemadd#addbutton" onClick={() => content.addClicked()}>
        {' '}
        Add{' '}
      </button>
      <button key="ui#itemadd#cancelbutton" onClick={() => content.addCancel()}>
        {' '}
        Cancel{' '}
      </button>
    </>
  );
};

export default ItemAddPane;
