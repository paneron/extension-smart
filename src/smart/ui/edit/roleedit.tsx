import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import {
  EditorModel,
  isEditorApproval,
  isEditorProcess,
} from '../../model/editormodel';
import { MMELRole } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createRole } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const RoleEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
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

  function replaceReferences(matchid: string, replaceid: string) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorApproval(elm)) {
        if (elm.actor === matchid) {
          elm.actor = replaceid;
        }
        if (elm.approver === matchid) {
          elm.approver = replaceid;
        }
      } else if (isEditorProcess(elm)) {
        if (elm.actor === matchid) {
          elm.actor = replaceid;
        }
      }
    }
  }

  function removeRoleListItem(ids: string[]) {
    for (const id of ids) {
      delete model.roles[id];
      replaceReferences(id, '');
    }
    setModel(model);
  }

  function addRole(role: MMELRole): boolean {
    if (checkId(role.id, model.roles)) {
      model.roles[role.id] = role;
      setModel(model);
      return true;
    }
    return false;
  }

  function updateRole(oldid: string, role: MMELRole): boolean {
    if (oldid !== role.id) {
      if (checkId(role.id, model.roles)) {
        delete model.roles[oldid];
        model.roles[role.id] = role;
        replaceReferences(oldid, role.id);
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.roles[oldid] = role;
      setModel(model);
      return true;
    }
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
