import React, { useMemo, useState } from 'react';
import { useStoreState } from 'react-flow-renderer';
import { EditorNodeWithInfoCallback } from '../../model/FlowContainer';
import {
  EditorModel,
  EditorNode,  
  isEditorStartEvent,
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
import QuickEdit from './QuickEditComponents';
import { RefTextSelection } from '../../model/selectionImport';
import { ModelAction } from '../../model/editor/model';

export const SelectedNodeDescription: React.FC<{
  model: EditorModel;
  page: string;
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
  act?: (x: ModelAction) => void;
  provision?: RefTextSelection;
  onSelect?: (id: string | undefined) => void;
}> = function ({
  model,
  page,
  setDialog,
  CustomAttribute,
  CustomProvision,
  act,
  provision,
  onSelect,
}) {
  const flowSelect = useStoreState(store => store.selectedElements);
  const [selectedPage, setSelectedPage] = useState<string|undefined>(undefined);
  const [selected, setSelected] = useState<EditorNodeWithInfoCallback|undefined>(undefined);

  const current = model.pages[page];

  function deselect() {
    setSelected(undefined);
      if (onSelect) {
        onSelect(undefined);
      }       
  }

  useMemo(() => {
    if (flowSelect && flowSelect.length > 0) {      
      const s = flowSelect[0];         
      if (current.childs[s.id] || current.data[s.id]) {
        setSelected(s.data as EditorNodeWithInfoCallback);
        setSelectedPage(page);
        if (onSelect) {
          onSelect(s.id);
        }        
      }      
    } else {
      deselect();
    }
  }, [flowSelect]);

  if (selected && selectedPage) {
    if (page !== selectedPage) {      
      deselect();
    }
    if (!(current.childs[selected.id] || current.data[selected.id])) {
      deselect();
    }
  }

  const elm: EditorNodeWithInfoCallback | undefined = getElement(model.elements, selected);  

  return (
    <MGDSidebar>
      {elm ? (
        act && setDialog && !isEditorStartEvent(elm) ? (
          <QuickEdit
            node={elm}
            modelWrapper={{ page, model, type: 'model' }}
            setModel={() => {}}
            setDialog={setDialog}
            page={model.pages[page]}
            model={model}
            act={act}
            provision={provision}
          />
        ) : (
          <Describe
            node={elm}
            model={model}
            page={model.pages[page]}
            CustomAttribute={CustomAttribute}
            CustomProvision={CustomProvision}
          />
        )
      ) : (
        'Nothing is selected'
      )}
    </MGDSidebar>
  );
};

function getElement(  
  elms: Record<string, EditorNode>,
  selected: EditorNodeWithInfoCallback | undefined
): EditorNodeWithInfoCallback | undefined {
  if (selected) {
    const elm = elms[selected.id];
    if (elm) {
      return {
        ...selected,
        ...elm
      }
    }         
  }
  return undefined;  
}