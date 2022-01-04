import React, { useMemo } from 'react';
import { useStoreState, Elements, isNode } from 'react-flow-renderer';
import { EditorNodeWithInfoCallback } from '../../model/FlowContainer';
import {
  EditorModel,
  isEditorData,  
} from '../../model/editormodel';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { Describe } from './ViewComponentDetails';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { ModelWrapper } from '../../model/modelwrapper';
import { RefTextSelection } from '../../model/selectionImport';

export const SelectedNodeDescription: React.FC<{
  modelWrapper: ModelWrapper;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
  CustomProvision?: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
  }>;
  setModel?: (m: EditorModel) => void;
  provision?: RefTextSelection;
  getLatestLayoutMW?: () => ModelWrapper;
  onSelect?: (id: string | undefined) => void;
}> = function ({
  modelWrapper,
  setDialog,
  CustomAttribute,
  CustomProvision,
  setModel,
  provision,
  getLatestLayoutMW,
  onSelect,
}) {
  const model = modelWrapper.model;
  const pageid = modelWrapper.page;
  const selected = useStoreState(store => store.selectedElements);

  const elm: EditorNodeWithInfoCallback | null = getSelectedElement(selected);

  useMemo(
    () => onSelect !== undefined && onSelect(elm !== null ? elm.id : undefined),
    [elm]
  );

  function getSelectedElement(
    selected: Elements<unknown> | null
  ): EditorNodeWithInfoCallback | null {
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      const page = model.pages[pageid];
      const elm = model.elements[s.id];
      if (isNode(s) && elm !== undefined) {
        if (
          (page !== undefined && page.childs[s.id] !== undefined) ||
          isEditorData(elm)
        ) {
          return {
            ...(s.data as EditorNodeWithInfoCallback),
            ...model.elements[s.id],
          };
        }
      }
    }
    return null;
  }

  return (
    <MGDSidebar>
      {elm !== null ? (
          <Describe
            node={elm}
            model={model}
            page={model.pages[pageid]}
            CustomAttribute={CustomAttribute}
            CustomProvision={CustomProvision}
          />        
      ) : (
        'Nothing is selected'
      )}
    </MGDSidebar>
  );
};