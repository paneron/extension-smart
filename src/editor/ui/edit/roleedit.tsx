/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import {
  EditorModel,
  isEditorAppproval,
  isEditorProcess,
} from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELRole } from '../../serialize/interface/supportinterface';
import { createRole } from '../../utils/EditorFactory';
import { IListItem, IManageHandler, NormalTextField } from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const RoleEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function getRoleListItems(filter: string): IListItem[] {
    const smallfilter = filter.toLowerCase();
    const out: IListItem[] = [];
    for (const r in model.roles) {
      const role = model.roles[r];
      if (
        smallfilter === '' ||
        role.id.toLowerCase().indexOf(smallfilter) !== -1 ||
        role.name.toLowerCase().indexOf(smallfilter) !== -1
      ) {
        out.push({
          id: role.id,
          text: role.name,
        });
      }
    }
    return out;
  }

  function replaceReferences(matchid: string, replaceid: string) {
    for (const x in model.elements) {
      const elm = model.elements[x];
      if (isEditorAppproval(elm)) {
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

  function checkId(id: string): boolean {
    if (id === '') {
      alert('New ID is empty');
      return false;
    }
    if (model.roles[id] !== undefined) {
      alert('New ID already exists');
      return false;
    }
    return true;
  }

  function addRole(role: MMELRole): boolean {
    if (checkId(role.id)) {
      model.roles[role.id] = role;
      return true;
    }
    return false;
  }

  function updateRole(oldid: string, role: MMELRole): boolean {
    if (oldid !== role.id) {
      if (checkId(role.id)) {
        delete model.roles[oldid];
        model.roles[role.id] = role;
        replaceReferences(oldid, role.id);
        return true;
      }
      return false;
    } else {
      model.roles[oldid] = role;
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

  const rolehandler: IManageHandler = {
    filterName: 'Role filter',
    itemName: 'Roles',
    Content: RoleEditItemPage,
    initObj: createRole(''),
    getItems: getRoleListItems,
    removeItems: removeRoleListItem,
    addItem: obj => addRole(obj as MMELRole),
    updateItem: (oldid, obj) => updateRole(oldid, obj as MMELRole),
    getObjById: getRoleById,
  };

  return <ListManagePage {...rolehandler} />;
};

const RoleEditItemPage: React.FC<{
  object: MMELObject;
  setObject: (obj: MMELObject) => void;
}> = ({ object, setObject }) => {
  const role = object as MMELRole;
  return (
    <>
      <NormalTextField
        key="field#roleid"
        text="Role ID"
        value={role.id}
        update={(x: string) => {
          role.id = x.replaceAll(/\s+/g, '');
          setObject({ ...role });
        }}
      />
      <NormalTextField
        key="field#rolename"
        text="Role Name"
        value={role.name}
        update={(x: string) => {
          role.name = x;
          setObject({ ...role });
        }}
      />
    </>
  );
};

export default RoleEditPage;
