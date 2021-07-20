/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { MMELReference } from '../../../serialize/interface/supportinterface';
import { IRef } from '../../interface/datainterface';
import { ModelWrapper } from '../../model/modelwrapper';
import { RefHandler } from '../handle/refhandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const RefEditPage: React.FC<{
  modelWrapper: ModelWrapper;
  isVisible: boolean;
}> = ({ modelWrapper, isVisible }) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [ref, setUpdateRef] = useState<MMELReference | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<IRef>({
    refid: '',
    document: '',
    clause: '',
  });

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new RefHandler(
    modelWrapper,
    ref,
    setAddMode,
    setUpdateMode,
    setUpdateRef,
    forceUpdate,
    data,
    setData
  );

  return (
    <>
      <div
        style={{
          display: isVisible && !isAdd && !isUpdate ? 'inline' : 'none',
        }}
      >
        <ListManagerPane {...handle} />
      </div>
      <div style={{ display: isVisible && isAdd ? 'inline' : 'none' }}>
        <p>
          {' '}
          You may add multiple clauses at the same time. Use , to separate the
          clauses to be added under the same document.{' '}
        </p>
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: isVisible && isUpdate ? 'inline' : 'none' }}>
        <ItemUpdatePane {...handle} />
      </div>
    </>
  );
};

export default RefEditPage;
