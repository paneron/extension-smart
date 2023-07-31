import { Button, ButtonGroup, FormGroup, Menu } from '@blueprintjs/core';
import {
  ItemListRenderer,
  ItemPredicate,
  ItemRenderer,
  Select,
} from '@blueprintjs/select';
import React from 'react';
import { AttributeType } from '@/smart/ui/edit/components/AttributeList';

const DataTypeSelect = Select.ofType<AttributeType>();

const TypeSelectRender: ItemRenderer<AttributeType> = function (
  item,
  { handleClick, modifiers }
) {
  return (
    <Button
      alignText="left"
      minimal
      fill
      active={modifiers.active}
      intent={modifiers.active ? 'primary' : 'none'}
      key={item.id}
      onClick={handleClick}
    >
      {item.display}
    </Button>
  );
};

const TypeSelectFilter: ItemPredicate<AttributeType> = function (query, item) {
  return item.name.toLowerCase().includes(query.toLowerCase());
};

const DataTypeSelector: React.FC<{
  activeItem: AttributeType | null;
  items: AttributeType[];
  onItemSelect: (x: AttributeType | null) => void;
  label: string;
}> = function (props) {
  const { activeItem, onItemSelect, label } = props;

  const DataTypeListRender: ItemListRenderer<AttributeType> = function (props) {
    const { filteredItems, itemsParentRef, renderItem } = props;

    return (
      <Menu
        ulRef={itemsParentRef}
        className="bp3-popover-content-sizing"
        style={{
          maxHeight : '35vh',
          maxWidth  : '30vw',
          overflowY : 'auto',
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(renderItem)
        ) : (
          <Button fill minimal alignText="left">
            No data type avaiable
          </Button>
        )}
      </Menu>
    );
  };

  return (
    <FormGroup label={label}>
      <ButtonGroup>
        <DataTypeSelect
          itemRenderer={TypeSelectRender}
          itemPredicate={TypeSelectFilter}
          itemListRenderer={DataTypeListRender}
          {...props}
        >
          <Button rightIcon="double-caret-vertical">
            {activeItem !== null ? activeItem.name : 'Not specified'}
          </Button>
        </DataTypeSelect>
        <Button
          intent="danger"
          icon="cross"
          minimal
          onClick={() => onItemSelect(null)}
        />
      </ButtonGroup>
    </FormGroup>
  );
};

export default DataTypeSelector;
