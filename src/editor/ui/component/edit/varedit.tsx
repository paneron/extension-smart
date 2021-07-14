import React, { useState } from 'react';
import { MMELModel } from '../../../serialize/interface/model';
import { MMELVariable } from '../../../serialize/interface/supportinterface';
import { IVar } from '../../interface/datainterface';
import { VarHandler } from '../handle/varhandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const VarEditPage: React.FC<{ model: MMELModel; isVisible: boolean }> = ({
  model,
  isVisible,
}) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [variable, setUpdateVariable] = useState<MMELVariable | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<IVar>({
    id: '',
    type: '',
    definition: '',
    description: '',
  });

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new VarHandler(
    model,
    variable,
    setAddMode,
    setUpdateMode,
    setUpdateVariable,
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

export default VarEditPage;
