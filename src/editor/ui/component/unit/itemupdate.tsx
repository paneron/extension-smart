/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { IUpdateItem } from '../../interface/fieldinterface';

const ItemUpdatePane: React.FC<IUpdateItem> = (content: IUpdateItem) => {
  const elms: Array<JSX.Element> = content.getUpdateFields();
  return (
    <>
      {elms}
      <button
        key="ui#itemupdate#addbutton"
        onClick={() => content.updateClicked()}
      >
        {' '}
        Update{' '}
      </button>
      <button
        key="ui#itemupdate#cancelbutton"
        onClick={() => content.updateCancel()}
      >
        {' '}
        Cancel{' '}
      </button>
    </>
  );
};

export default ItemUpdatePane;
