/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, ButtonGroup, FormGroup, Text } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
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
  return (
    <FormGroup label={label}>
      <ButtonGroup>
        <RoleSelect
          itemRenderer={RoleSelectRender}
          itemPredicate={RoleSelectFilter}
          noResults={<Text>No role avaiable</Text>}
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
