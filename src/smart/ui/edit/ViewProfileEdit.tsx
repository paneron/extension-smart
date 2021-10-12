/** @jsx jsx */
/** @jsxFrag React.Fragment */

import {
  Text,
  Checkbox,
  ControlGroup,
  FormGroup,
  InputGroup,
  Switch,
} from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELView, VarType } from '../../serialize/interface/supportinterface';
import { checkId, defaultItemSorter } from '../../utils/ModelFunctions';
import { createView } from '../../utils/EditorFactory';
import {
  IListItem,
  IManageHandler,
  NormalComboBox,
  NormalTextField,
} from '../common/fields';
import ListManagePage from '../common/listmanagement/listmanagement';

const ViewProfileEditPage: React.FC<{
  model: EditorModel;
  setModel: (model: EditorModel) => void;
}> = function ({ model, setModel }) {
  function matchFilter(x: MMELView, filter: string) {
    return (
      filter === '' ||
      x.id.toLowerCase().includes(filter) ||
      x.name.toLowerCase().includes(filter)
    );
  }

  function getViewListItems(filter: string): IListItem[] {
    return Object.values(model.views)
      .filter(x => matchFilter(x, filter))
      .map(x => ({ id: x.id, text: x.name }))
      .sort(defaultItemSorter);
  }

  function removeViewListItem(ids: string[]) {
    for (const id of ids) {
      delete model.views[id];
    }
    setModel(model);
  }

  function addView(x: MMELView): boolean {
    if (checkId(x.id, model.views)) {
      model.views[x.id] = { ...x };
      setModel(model);
      return true;
    }
    return false;
  }

  function updateView(oldid: string, x: MMELView): boolean {
    if (oldid !== x.id) {
      if (checkId(x.id, model.views)) {
        delete model.views[oldid];
        model.views[x.id] = { ...x };
        setModel(model);
        return true;
      }
      return false;
    } else {
      model.views[oldid] = { ...x };
      setModel(model);
      return true;
    }
  }

  function getViewById(id: string): MMELView {
    const view = model.views[id];
    if (view === undefined) {
      return createView('');
    }
    return view;
  }

  const viewhandler: IManageHandler<MMELView> = {
    filterName: 'View Profile filter',
    itemName: 'View profiles',
    Content: ViewEditItemPage,
    initObj: createView(''),
    model: model,
    getItems: getViewListItems,
    removeItems: removeViewListItem,
    addItem: obj => addView(obj),
    updateItem: (oldid, obj) => updateView(oldid, obj),
    getObjById: getViewById,
  };

  return <ListManagePage {...viewhandler} />;
};

const ViewEditItemPage: React.FC<{
  object: MMELView;
  model?: EditorModel;
  setObject: (obj: MMELView) => void;
}> = ({ object: view, model, setObject: setView }) => {
  const vars = model!.vars;
  const profile = view.profile;

  function onItemChange(on: boolean, id: string, value: string) {
    if (on) {
      profile[id] = {
        id,
        isConst: false,
        value,
      };
    } else {
      delete profile[id];
    }
    setView({ ...view });
  }

  function onEditableChange(x: boolean, id: string) {
    setView({
      ...view,
      profile: { ...profile, [id]: { ...profile[id], isConst: x } },
    });
  }

  return (
    <FormGroup>
      <NormalTextField
        text="Profile ID"
        value={view.id}
        onChange={x => setView({ ...view, id: x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Profile name"
        value={view.name}
        onChange={x => setView({ ...view, name: x })}
      />
      <Text>
        Select the settings you want to include in the profile and provide the
        (default) value for the settings.
      </Text>
      {Object.values(vars).map(v => {
        if (v.type !== VarType.DERIVED) {
          const InputTool = Inputs[v.type];
          const defValue = DefaultValues[v.type];
          return (
            <FormGroup key={v.id}>
              <Checkbox
                checked={profile[v.id] !== undefined}
                label={v.description}
                onChange={x =>
                  onItemChange(x.currentTarget.checked, v.id, defValue)
                }
              />
              {profile[v.id] !== undefined && (
                <ControlGroup>
                  <InputTool
                    value={profile[v.id].value}
                    onChange={x => {
                      profile[v.id].value = x;
                      setView({ ...view });
                    }}
                  />
                  <Switch
                    checked={!profile[v.id].isConst}
                    innerLabelChecked="Editable by user"
                    innerLabel="Not editable"
                    onChange={x =>
                      onEditableChange(!x.currentTarget.checked, v.id)
                    }
                  />
                </ControlGroup>
              )}
            </FormGroup>
          );
        }
        return <></>;
      })}
    </FormGroup>
  );
};

type InputableVarType = Exclude<VarType, typeof VarType.DERIVED>;

const DefaultValues: Record<InputableVarType, string> = {
  [VarType.BOOLEAN]: 'true',
  [VarType.DATA]: '0',
  [VarType.LISTDATA]: '0',
  [VarType.TEXT]: '',
};

const Inputs: Record<
  InputableVarType,
  React.FC<{ value: string; onChange: (x: string) => void }>
> = {
  [VarType.BOOLEAN]: ({ value, onChange }) => (
    <NormalComboBox
      text="Default value"
      options={['true', 'false']}
      value={value}
      onChange={onChange}
      noContainer
      fill
    />
  ),
  [VarType.DATA]: ({ value, onChange }) => (
    <InputGroup
      placeholder="Default value"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
  [VarType.LISTDATA]: ({ value, onChange }) => (
    <InputGroup
      placeholder="Default values (seperate by ,)"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
  [VarType.TEXT]: ({ value, onChange }) => (
    <InputGroup
      placeholder="Default value"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
};

export default ViewProfileEditPage;
