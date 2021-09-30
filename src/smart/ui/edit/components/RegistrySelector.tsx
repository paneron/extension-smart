/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Button, FormGroup, Menu } from '@blueprintjs/core';
import {
  IItemRendererProps,
  ItemListRenderer,
  ItemPredicate,
  MultiSelect,
} from '@blueprintjs/select';
import { EditorRegistry } from '../../../model/editormodel';

const RegistryMultiSelect = MultiSelect.ofType<EditorRegistry>();

function RegistrySelectRender(
  item: EditorRegistry,
  props: IItemRendererProps,
  selected: Set<string>
) {
  const { handleClick, modifiers } = props;
  return (
    <Button
      icon={selected.has(item.id) ? 'tick' : 'blank'}
      alignText="left"
      minimal
      fill
      active={modifiers.active}
      intent={modifiers.active ? 'primary' : 'none'}
      key={item.id}
      onClick={handleClick}
    >
      {item.title}
    </Button>
  );
}

const RegistrySelectFilter: ItemPredicate<EditorRegistry> = function (
  query,
  item
) {
  return item.title.toLowerCase().includes(query.toLowerCase());
};

const RegistryTagRender = function (item: EditorRegistry) {
  return item.title;
};

const RegistrySelector: React.FC<{
  items: EditorRegistry[];
  onItemSelect: (x: EditorRegistry) => void;
  onTagRemove: (x: string) => void;
  label: string;
  selected: Set<string>;
}> = function (props) {
  const { label, items, selected, onTagRemove } = props;
  const selectedItems = items.filter(x => selected.has(x.id));

  const RegistryListRender: ItemListRenderer<EditorRegistry> = function (
    props
  ) {
    const { filteredItems, itemsParentRef, renderItem } = props;

    return (
      <Menu
        ulRef={itemsParentRef}
        className="bp3-popover-content-sizing"
        style={{
          maxHeight: '35vh',
          overflowY: 'auto',
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(renderItem)
        ) : (
          <Button fill minimal alignText="left">
            No registry avaiable
          </Button>
        )}
      </Menu>
    );
  };

  return (
    <FormGroup label={label}>
      <RegistryMultiSelect
        itemRenderer={(item, props) =>
          RegistrySelectRender(item, props, selected)
        }
        itemPredicate={RegistrySelectFilter}
        tagRenderer={RegistryTagRender}
        selectedItems={selectedItems}
        tagInputProps={{
          onRemove: (_, index) => onTagRemove(selectedItems[index].id),
        }}
        placeholder="Search Registry..."
        itemListRenderer={RegistryListRender}
        resetOnSelect
        fill
        {...props}
      />
    </FormGroup>
  );
};

export default RegistrySelector;
