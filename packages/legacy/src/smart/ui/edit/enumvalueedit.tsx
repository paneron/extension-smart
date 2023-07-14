import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDDisplayPane from '@/smart/MGDComponents/MGDDisplayPane';
import { EditorModel } from '@/smart/model/editormodel';
import { MMELEnumValue } from '@paneron/libmmel/interface/datainterface';
import { createEnumValue } from '@/smart/utils/EditorFactory';
import { NormalTextField } from '@/smart/ui/common/fields';
import ListWithPopoverItem, {
  IMMELObject,
} from '@/smart/ui/common/listmanagement/listPopoverItem';

const EnumValueEditPage: React.FC<{
  values: Record<string, MMELEnumValue>;
  model: EditorModel;
  setValues: (x: Record<string, MMELEnumValue>) => void;
}> = ({ values, model, setValues }) => {
  function matchFilter(x: IMMELObject, filter: string) {
    return filter === '' || x.id.toLowerCase().includes(filter);
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
  object: MMELEnumValue;
  setObject: (obj: MMELEnumValue) => void;
}> = ({ object: ev, setObject: setEV }) => {
  return (
    <MGDDisplayPane>
      <FormGroup>
        <NormalTextField
          key="field#valueid"
          text="Enumeration item ID"
          value={ev.id}
          onChange={x => {
            ev.id = x.replaceAll(/\s+/g, '');
            setEV({ ...ev });
          }}
        />
        <NormalTextField
          key="field#valuecontent"
          text="Enumeration item value"
          value={ev.value}
          onChange={x => {
            ev.value = x;
            setEV({ ...ev });
          }}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default EnumValueEditPage;
