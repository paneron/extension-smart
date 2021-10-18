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
import { MMELReference } from '../../../serialize/interface/supportinterface';
import { toRefSummary } from '../../../utils/ModelFunctions';

const ReferenceMultiSelect = MultiSelect.ofType<MMELReference>();

function ReferenceSelectRender(
  item: MMELReference,
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
      {toRefSummary(item)}
    </Button>
  );
}

const ReferenceSelectFilter: ItemPredicate<MMELReference> = function (
  query,
  item
) {
  const items = query.toLowerCase().split(/\s+/);
  for (const q of items) {
    if (
      !item.title.toLowerCase().includes(q) &&
      !item.clause.toLowerCase().includes(q) &&
      !item.document.toLowerCase().includes(q) &&
      !item.id.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
};

const ReferenceTagRender = function (item: MMELReference) {
  return item.clause;
};

const SimpleReferenceSelector: React.FC<{
  items: MMELReference[];
  onItemSelect: (x: MMELReference) => void;
  onTagRemove: (x: string) => void;
  selected: Set<string>;
}> = function (props) {
  const { items, selected, onTagRemove } = props;
  const selectedItems = items.filter(x => selected.has(x.id));

  const ReferenceListRender: ItemListRenderer<MMELReference> = function (
    props
  ) {
    const { filteredItems, itemsParentRef, renderItem } = props;

    return (
      <Menu
        ulRef={itemsParentRef}
        className="bp3-popover-content-sizing"
        style={{
          maxHeight: '35vh',
          maxWidth: '30vw',
          overflowY: 'auto',
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(renderItem)
        ) : (
          <Button fill minimal alignText="left">
            No reference avaiable
          </Button>
        )}
      </Menu>
    );
  };

  return (
    <FormGroup label="Reference">
      <ReferenceMultiSelect
        itemRenderer={(item, props) =>
          ReferenceSelectRender(item, props, selected)
        }
        itemPredicate={ReferenceSelectFilter}
        tagRenderer={ReferenceTagRender}
        selectedItems={selectedItems}
        tagInputProps={{
          onRemove: (_, index) => onTagRemove(selectedItems[index].id),
        }}
        placeholder="Search Reference..."
        itemListRenderer={ReferenceListRender}
        resetOnSelect
        fill
        {...props}
      />
    </FormGroup>
  );
};

export default SimpleReferenceSelector;
