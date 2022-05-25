import { Button, ButtonGroup, FormGroup, Menu } from '@blueprintjs/core';
import {
  ItemListRenderer,
  ItemPredicate,
  ItemRenderer,
  Select,
} from '@blueprintjs/select';
import { MMELRole } from '../../../serialize/interface/supportinterface';
import React from 'react';

const RoleSelect = Select.ofType<MMELRole>();

const RoleSelectRender: ItemRenderer<MMELRole> = function (
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
      {item.name}
    </Button>
  );
};

const RoleSelectFilter: ItemPredicate<MMELRole> = function (query, item) {
  return item.name.toLowerCase().includes(query.toLowerCase());
};

const RoleSelector: React.FC<{
  activeItem: MMELRole | null;
  items: MMELRole[];
  onItemSelect: (x: MMELRole | null) => void;
  label: string;
}> = function (props) {
  const { activeItem, onItemSelect, label } = props;

  const RoleListRender: ItemListRenderer<MMELRole> = function (props) {
    const { filteredItems, itemsParentRef, renderItem } = props;

    return (
      <Menu
        ulRef={itemsParentRef}
        className="bp3-popover-content-sizing"
        style={{
          maxHeight : '35vh',
          overflowY : 'auto',
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(renderItem)
        ) : (
          <Button fill minimal alignText="left">
            No role avaiable
          </Button>
        )}
      </Menu>
    );
  };

  return (
    <FormGroup label={label}>
      <ButtonGroup>
        <RoleSelect
          itemRenderer={RoleSelectRender}
          itemPredicate={RoleSelectFilter}
          itemListRenderer={RoleListRender}
          {...props}
        >
          <Button rightIcon="double-caret-vertical">
            {activeItem !== null ? activeItem.name : 'Not specified'}
          </Button>
        </RoleSelect>
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

export default RoleSelector;
