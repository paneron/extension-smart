import {
  Text,
  Checkbox,
  ControlGroup,
  FormGroup,
  InputGroup,
  Switch,
} from '@blueprintjs/core';
import React from 'react';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MMELView } from '@paneron/libmmel/interface/supportinterface';
import { VarType } from '@paneron/libmmel/interface/supportinterface';
import { checkId, defaultItemSorter } from '@/smart/utils/ModelFunctions';
import { createView } from '@/smart/utils/EditorFactory';
import type {
  IListItem,
  IManageHandler } from '@/smart/ui/common/fields';
import {
  NormalComboBox,
  NormalTextField,
} from '@/smart/ui/common/fields';
import ListManagePage from '@/smart/ui/common/listmanagement/listmanagement';
import type { InputableVarType } from '@/smart/model/Measurement';
import type { ModelAction } from '@/smart/model/editor/model';

const ViewProfileEditPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
}> = function ({ model, act }) {
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
      .map(x => ({ id : x.id, text : x.name }))
      .sort(defaultItemSorter);
  }

  function removeViewListItem(ids: string[]) {
    const action: ModelAction = {
      type  : 'model',
      act   : 'view',
      task  : 'delete',
      value : ids,
    };
    act(action);
  }

  function addView(x: MMELView): boolean {
    if (checkId(x.id, model.views)) {
      const action: ModelAction = {
        type  : 'model',
        act   : 'view',
        task  : 'add',
        value : [x],
      };
      act(action);
      return true;
    }
    return false;
  }

  function updateView(oldid: string, x: MMELView): boolean {
    if (oldid !== x.id && !checkId(x.id, model.views)) {
      return false;
    }
    const action: ModelAction = {
      type  : 'model',
      act   : 'view',
      task  : 'edit',
      id    : oldid,
      value : x,
    };
    act(action);
    return true;
  }

  function getViewById(id: string): MMELView {
    const view = model.views[id];
    if (view === undefined) {
      return createView('');
    }
    return view;
  }

  const viewhandler: IManageHandler<MMELView> = {
    filterName  : 'View Profile filter',
    itemName    : 'View profiles',
    Content     : ViewEditItemPage,
    initObj     : createView(''),
    model       : model,
    getItems    : getViewListItems,
    removeItems : removeViewListItem,
    addItem     : obj => addView(obj),
    updateItem  : (oldid, obj) => updateView(oldid, obj),
    getObjById  : getViewById,
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
    const newProfile = { ...profile };
    if (on) {
      newProfile[id] = {
        id,
        isConst : false,
        value,
      };
    } else {
      delete newProfile[id];
    }
    setView({ ...view, profile : newProfile });
  }

  function onEditableChange(x: boolean, id: string) {
    setView({
      ...view,
      profile : { ...profile, [id] : { ...profile[id], isConst : x }},
    });
  }

  return (
    <FormGroup>
      <NormalTextField
        text="Profile ID"
        value={view.id}
        onChange={x => setView({ ...view, id : x.replaceAll(/\s+/g, '') })}
      />
      <NormalTextField
        text="Profile name"
        value={view.name}
        onChange={x => setView({ ...view, name : x })}
      />
      <Text>
        Select the settings you want to include in the profile and provide the
        (default) value for the settings.
      </Text>
      {Object.values(vars).map(v => {
        if (
          v.type !== VarType.DERIVED &&
          v.type !== VarType.TABLE &&
          v.type !== VarType.TABLEITEM
        ) {
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
                      const newProfile = { ...profile };
                      newProfile[v.id] = { ...profile[v.id], value : x };
                      setView({ ...view, profile : newProfile });
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

const DefaultValues: Record<InputableVarType, string> = {
  [VarType.BOOLEAN]   : 'true',
  [VarType.DATA]      : '0',
  [VarType.LISTDATA]  : '0',
  [VarType.TEXT]      : '',
  [VarType.TABLEITEM] : '',
};

interface Props { value: string; onChange: (x: string) => void }

const Inputs: Record<
  InputableVarType,
  React.FC<Props>
> = {
  [VarType.BOOLEAN] : ({ value, onChange }: Props) => (
    <NormalComboBox
      text="Default value"
      options={['true', 'false']}
      value={value}
      onChange={onChange}
      noContainer
      fill
    />
  ),
  [VarType.DATA] : ({ value, onChange }: Props) => (
    <InputGroup
      placeholder="Default value"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
  [VarType.LISTDATA] : ({ value, onChange }: Props) => (
    <InputGroup
      placeholder="Default values (seperate by ,)"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
  [VarType.TEXT] : ({ value, onChange }: Props) => (
    <InputGroup
      placeholder="Default value"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
  [VarType.TABLEITEM] : ({ value, onChange }: Props) => (
    <InputGroup
      placeholder="Default value"
      value={value}
      onChange={x => onChange(x.target.value)}
      fill
    />
  ),
};

export default ViewProfileEditPage;
