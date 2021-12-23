import {
  HotkeysProvider,
  HotkeysTarget2,
  IToaster,
  Toaster,
} from '@blueprintjs/core';
import React from 'react';
import { useState } from 'react';
import { useEditorState } from '../../model/editor/state';
import { isEditorProcess } from '../../model/editormodel';
import { createModelHistory } from '../../model/history';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { EditorState } from '../../model/States';
import { createNewEditorModel } from '../../utils/EditorFactory';
import { addExisingProcessToPage } from '../../utils/ModelAddComponentHandler';
import ModelEditor from '../maineditor';

const initModel = createNewEditorModel();
const initStateValue: EditorState = {
  model: initModel,
  history: createModelHistory(initModel),
  page: initModel.root,
  type: 'model',
};

const EditWrapper: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  repo: MMELRepo;
  index: RepoIndex;
}> = function (props) {
  const [state, act, undoState, redoState, initState] =
    useEditorState(initStateValue);

  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState<string | undefined>(undefined);
  const [toaster] = useState<IToaster>(Toaster.create());

  const hotkeys = [
    {
      combo: 'ctrl+z',
      global: true,
      label: 'Undo',
      onKeyDown: undo,
    },
    {
      combo: 'ctrl+y',
      global: true,
      label: 'Redo',
      onKeyDown: redo,
    },
    {
      combo: 'ctrl+c',
      global: true,
      label: 'Copy',
      onKeyDown: copy,
    },
    {
      combo: 'ctrl+v',
      global: true,
      label: 'Paste',
      onKeyDown: paste,
    },
  ];

  function updateState(newState: EditorState, requireHistory: boolean) {
    // setState(newState);
  }

  function redo() {
    if (undoState) {
      undoState();
    }
  }

  function undo() {
    if (redoState) {
      redoState();
    }
  }

  function copy() {
    if (selected !== undefined) {
      setCopied(selected);
      toaster.show({
        message: `Process ${selected} marked`,
        intent: 'success',
      });
    }
  }

  function setSelectedId(id: string | undefined) {
    if (id !== undefined) {
      const elm = state.model.elements[id];
      if (elm !== undefined && isEditorProcess(elm)) {
        setSelected(id);
      } else {
        setSelected(undefined);
      }
    } else {
      setSelected(undefined);
    }
  }

  function paste() {
    if (copied !== undefined) {
      const model = state.model;
      const elm = model.elements[copied];
      if (elm !== undefined) {
        try {
          const newModel = addExisingProcessToPage(
            model,
            state.history,
            state.page,
            elm.id
          );
          updateState({ ...state, model: newModel }, true);
        } catch (e: unknown) {
          const error = e as Error;
          toaster.show({
            message: `Error: ${error.message}`,
            intent: 'danger',
          });
        }
      }
    }
  }

  return (
    <HotkeysProvider>
      <HotkeysTarget2 hotkeys={hotkeys}>
        <ModelEditor
          {...props}
          state={state}
          setState={updateState}
          redo={undoState}
          undo={redoState}
          copy={selected !== undefined ? copy : undefined}
          paste={copied !== undefined ? paste : undefined}
          setSelectedId={setSelectedId}
          initState={initState}
        />
      </HotkeysTarget2>
    </HotkeysProvider>
  );
};

export default EditWrapper;
