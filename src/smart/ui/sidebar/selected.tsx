/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { useStoreState, Elements, isNode } from 'react-flow-renderer';
import { EdtiorNodeWithInfoCallback } from '../../model/FlowContainer';
import { EditorModel, isEditorData } from '../../model/editormodel';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../utils/constants';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { Describe } from './SelectedComponents';

export const SelectedNodeDescription: React.FC<{
  model: EditorModel;
  pageid: string;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  onSubprocessClick?: (pid: string) => void;
}> = function ({ model, setDialog, onSubprocessClick, pageid }) {
  const selected = useStoreState(store => store.selectedElements);

  const elm: EdtiorNodeWithInfoCallback | null = getSelectedElement(selected);

  function getSelectedElement(
    selected: Elements<unknown> | null
  ): EdtiorNodeWithInfoCallback | null {
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
            ...(s.data as EdtiorNodeWithInfoCallback),
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
          setDialog={setDialog}
          onSubprocessClick={onSubprocessClick}
          page={model.pages[pageid]}
        />
      ) : (
        'Nothing is selected'
      )}
    </MGDSidebar>
  );
};
