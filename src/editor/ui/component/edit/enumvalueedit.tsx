/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { IEnum, IEnumValue } from '../../interface/datainterface';
import { EnumValueHandler } from '../handle/enumvaluehandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const EnumValueEditPage: React.FC<{ en: IEnum; setEnum: (x: IEnum) => void }> =
  ({ en, setEnum }) => {
    const [isAdd, setAddMode] = useState(false);
    const [isUpdate, setUpdateMode] = useState(false);
    const [value, setUpdateValue] = useState<IEnumValue | null>(null);
    const [data, setData] = useState<IEnumValue>({ id: '', value: '' });

    const forceUpdate = () => {
      setEnum({ ...en });
    };

    const handle = new EnumValueHandler(
      en,
      value,
      setAddMode,
      setUpdateMode,
      setUpdateValue,
      forceUpdate,
      data,
      setData
    );

    return (
      <fieldset>
        <legend>Enum values:</legend>
        <div style={{ display: !isAdd && !isUpdate ? 'inline' : 'none' }}>
          <ListManagerPane {...handle} />
        </div>
        <div style={{ display: isAdd ? 'inline' : 'none' }}>
          <ItemAddPane {...handle} />
        </div>
        <div style={{ display: isUpdate ? 'inline' : 'none' }}>
          <ItemUpdatePane {...handle} />
        </div>
      </fieldset>
    );
  };

export default EnumValueEditPage;
