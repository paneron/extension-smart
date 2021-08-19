/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { EditorModel } from '../../model/editormodel';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELEnumValue } from '../../serialize/interface/datainterface';
import { createEnumValue } from '../../utils/EditorFactory';
import { NormalTextField } from '../common/fields';
import ListWithPopoverItem, {
  IObject,
} from '../common/listmanagement/listPopoverItem';

const EnumValueEditPage: React.FC<{
  values: Record<string, MMELEnumValue>;
  model: EditorModel;
  setValues: (x: Record<string, MMELEnumValue>) => void;
}> = ({ values, model, setValues }) => {
  function matchFilter(x: IObject, filter: string) {
    return filter === '' || x.id.toLowerCase().indexOf(filter) !== -1;
  }

  return (
    <ListWithPopoverItem
      items={values}
      setItems={x => setValues(x as Record<string, MMELEnumValue>)}
      model={model}
      initObject={createEnumValue('')}
      matchFilter={matchFilter}
      filterName="Value filter"
      Content={EnumValueItem}
      label="Enumeration values"
    />
  );
};

const EnumValueItem: React.FC<{
  object: MMELObject;
  model: EditorModel;
  setObject: (obj: MMELObject) => void;
}> = ({ object, setObject }) => {
  const ev = object as MMELEnumValue;

  return (
    <FormGroup>
      <NormalTextField
        key="field#valueid"
        text="Enumeration item ID"
        value={ev.id}
        onChange={x => {
          ev.id = x.replaceAll(/\s+/g, '');
          setObject({ ...ev });
        }}
      />
      <NormalTextField
        key="field#valuecontent"
        text="Enumeration item value"
        value={ev.value}
        onChange={x => {
          ev.value = x;
          setObject({ ...ev });
        }}
      />
    </FormGroup>
  );
};

export default EnumValueEditPage;
