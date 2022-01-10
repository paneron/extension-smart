import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELRole } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createRole } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';
import { ModelAction } from '../../model/editor/model';
import {
  addRoleCommand,
  deleteRoleCommand,
  editRoleCommand,
} from '../../model/editor/commands/role';

const RoleEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
  function matchFilter(role: MMELRole, filter: string) {
    return (
      filter === '' ||
      role.id.toLowerCase().includes(filter) ||
      role.name.toLowerCase().includes(filter)
    );
  }

  function getRoleListItems(filter: string): IListItem[] {
    return Object.values(model.roles)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.name }))
      .sort(defaultItemSorter);
  }

  function removeRoleListItem(ids: string[]) {
    act(deleteRoleCommand(ids));
  }

  function addRole(role: MMELRole): boolean {
    if (!checkId(role.id, model.roles)) {
      return false;
    }
    act(addRoleCommand(role));
    return true;
  }

  function updateRole(oldid: string, role: MMELRole): boolean {
    if (oldid !== role.id && !checkId(role.id, model.sections)) {
      return false;
    }
    act(editRoleCommand(oldid, role));
    return true;
  }

  function getRoleById(id: string): MMELRole {
    const role = model.roles[id];
    if (role === undefined) {
      return createRole('');
    }
    return role;
  }

  const rolehandler: IManageHandler<MMELRole> = {
    filterName: 'Role filter',
    itemName: 'Roles',
    Content: RoleEditItemPage,
    initObj: createRole(''),
    model: model,
    getItems: getRoleListItems,
    removeItems: removeRoleListItem,
    addItem: obj => addRole(obj),
    updateItem: (oldid, obj) => updateRole(oldid, obj),
    getObjById: getRoleById,
  };

  return <ListManagePage {...rolehandler} />;
};

const RoleEditItemPage: React.FC<{
  object: MMELRole;
  setObject: (obj: MMELRole) => void;
}> = ({ object: role, setObject: setRole }) => {
  return (
    <FormGroup>
      <NormalTextField
        text="Role ID"
        value={role.id}
        onChange={x => setRole({ ...role, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Role Name"
        value={role.name}
        onChange={x => setRole({ ...role, name: x })}
      />
    </FormGroup>
  );
};

export default RoleEditPage;
