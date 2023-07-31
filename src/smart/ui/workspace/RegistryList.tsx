import React from 'react';
import {
  EditorModel,
  EditorRegistry,
  isEditorRegistry,
} from '@/smart/model/editormodel';
import { defaultItemSorter } from '@/smart/utils/ModelFunctions';
import {
  IAdditionalListButton,
  IListItem,
  IViewListInterface,
} from '@/smart/ui/common/fields';
import ListViewPane from '@/smart/ui/common/listmanagement/listview';

const WorkspaceRegistryList: React.FC<{
  model: EditorModel;
  setRegistry: (id: string) => void;
}> = function ({ model, setRegistry }) {
  function matchFilter(reg: EditorRegistry, filter: string) {
    return (
      filter === '' ||
      reg.id.toLowerCase().includes(filter) ||
      reg.title.toLowerCase().includes(filter)
    );
  }

  function getRegListItems(filter: string): IListItem[] {
    return Object.values(model.elements)
      .filter(x => isEditorRegistry(x) && matchFilter(x, filter))
      .map(x => ({ id : x.id, text : (x as EditorRegistry).title }))
      .sort(defaultItemSorter);
  }

  const actionButton: IAdditionalListButton = {
    text    : 'Manage data registry',
    icon    : 'manually-entered-data',
    onClick : setRegistry,
  };

  const reghandler: IViewListInterface = {
    filterName : 'Registry filter',
    itemName   : 'Data Registries',
    getItems   : getRegListItems,
    size       : 15,
    isVisible  : true,
    buttons    : [actionButton],
  };

  return <ListViewPane {...reghandler} />;
};

export default WorkspaceRegistryList;
