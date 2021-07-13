import React, { useState } from 'react';
import { Enum } from '../../../model/model/data/enum';
import { IEnum } from '../../interface/datainterface';
import { ModelWrapper } from '../../model/modelwrapper';
import { EnumHandler } from '../handle/enumhandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const EnumEditPage: React.FC<{
  modelWrapper: ModelWrapper;
  isVisible: boolean;
}> = ({ modelWrapper, isVisible }) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [en, setUpdateEnum] = useState<Enum | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<IEnum>({ id: '', values: [] });

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new EnumHandler(
    modelWrapper,
    en,
    setAddMode,
    setUpdateMode,
    setUpdateEnum,
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

export default EnumEditPage;
