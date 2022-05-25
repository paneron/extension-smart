import { Button, FormGroup } from '@blueprintjs/core';
import React from 'react';
import { NormalTextField } from '../../common/fields';

const StringListQuickEdit: React.FC<{
  data: string[];
  setData: (x: string[]) => void;
  label: string;
  addButtonLabel: string;
}> = function ({ data, setData, label, addButtonLabel }) {
  function addItem() {
    setData([...data, '']);
  }

  return (
    <FormGroup label={label}>
      {data.map((p, index) => (
        <ItemQuickEdit
          key={index}
          item={p}
          setItem={x => {
            const newData = [...data];
            newData[index] = x;
            setData(newData);
          }}
          onDelete={() => {
            const newData = [...data];
            newData.splice(index, 1);
            setData(newData);
          }}
        />
      ))}
      <Button icon="plus" onClick={addItem}>
        {addButtonLabel}
      </Button>
    </FormGroup>
  );
};

const ItemQuickEdit: React.FC<{
  item: string;
  setItem: (x: string) => void;
  onDelete: () => void;
}> = function ({ item, setItem, onDelete }) {
  return (
    <div
      style={{
        position : 'relative',
      }}
    >
      <fieldset>
        <NormalTextField value={item} onChange={x => setItem(x)} />
        <div
          style={{
            position : 'absolute',
            right    : 0,
            top      : -8,
            zIndex   : 10,
          }}
        >
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default StringListQuickEdit;
