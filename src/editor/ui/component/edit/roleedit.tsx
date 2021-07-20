/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { MMELModel } from '../../../serialize/interface/model';
import { MMELRole } from '../../../serialize/interface/supportinterface';
import { IRole } from '../../interface/datainterface';
import { RoleHandler } from '../handle/roleshandler';
import ItemAddPane from '../unit/itemadd';
import ItemUpdatePane from '../unit/itemupdate';
import ListManagerPane from '../unit/listmanage';

const RoleEditPage: React.FC<{ model: MMELModel; isVisible: boolean }> = ({
  model,
  isVisible,
}) => {
  const [isAdd, setAddMode] = useState(false);
  const [isUpdate, setUpdateMode] = useState(false);
  const [role, setUpdateRole] = useState<MMELRole | null>(null);
  const [dummy, setDummy] = useState<boolean>(false);
  const [data, setData] = useState<IRole>({ roleid: '', rolename: '' });

  const forceUpdate = () => {
    setDummy(!dummy);
  };

  const handle = new RoleHandler(
    model,
    role,
    setAddMode,
    setUpdateMode,
    setUpdateRole,
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

export default RoleEditPage;
