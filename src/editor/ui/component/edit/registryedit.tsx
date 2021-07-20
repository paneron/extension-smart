/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { MMELRegistry } from '../../../serialize/interface/datainterface';
import { IRegistry } from '../../interface/datainterface';
import { ModelWrapper } from '../../model/modelwrapper';
import { RegistryHandler } from '../handle/registryhandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const RegistryEditPage: React.FC<{
  modelWrapper: ModelWrapper;
  isVisible: boolean;
}> = ({ modelWrapper, isVisible }) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [registry, setUpdateRegistry] = useState<MMELRegistry | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<IRegistry>({
    regid: '',
    regtitle: '',
    attributes: [],
  });

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new RegistryHandler(
    modelWrapper,
    registry,
    setAddMode,
    setUpdateMode,
    setUpdateRegistry,
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
        <ItemAddPane {...handle} />
      </div>
      <div style={{ display: isVisible && isUpdate ? 'inline' : 'none' }}>
        <ItemUpdatePane {...handle} />
      </div>
    </>
  );
};

export default RegistryEditPage;
