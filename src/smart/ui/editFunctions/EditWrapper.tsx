import {
  HotkeyConfig,
  HotkeysTarget2,
  IToaster,
  Toaster,
} from '@blueprintjs/core';
import React from 'react';
import { useState } from 'react';
import { useEditorState } from '../../model/editor/state';
import { EditorModel, isEditorProcess } from '../../model/editormodel';
import { createModelHistory } from '../../model/history';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { EditorState } from '../../model/States';
import { addExisingProcessToPage } from '../../utils/ModelAddComponentHandler';
import ModelEditor from '../maineditor';

const EditWrapper: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  repo: MMELRepo;
  index: RepoIndex;
  model: EditorModel;
}> = function (props) {
  const { model } = props;
  const initObj: EditorState = {
    model,
    history: createModelHistory(model),
    page: model.root,
    type: 'model',
  };
  const [state, act, undoState, redoState, clearRedo] = useEditorState(initObj);

  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState<string | undefined>(undefined);
  const [toaster] = useState<IToaster>(Toaster.create());
  const [, setUndoListener] = useState<(() => void) | undefined>(undefined);

  const hotkeys: HotkeyConfig[] = [
    {
      combo: 'ctrl+z',
      global: true,
      label: 'Undo',
      onKeyDown: undo,
      allowInInput: true,
    },
    {
      combo: 'ctrl+y',
      global: true,
      label: 'Redo',
      onKeyDown: redo,
      allowInInput: true,
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

  function undo() {
    if (undoState) {
      setUndoListener(u => {
        if (u) {
          u();
        }
        return u;
      });
      undoState();
    }
  }

  function redo() {
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
          addExisingProcessToPage(
            model,
            state.history,
            state.page,
            elm.id,
            act
          );
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
    <HotkeysTarget2 hotkeys={hotkeys}>
      <ModelEditor
        {...props}
        state={state}
        act={act}
        redo={redoState ? redo : undefined}
        undo={undoState ? undo : undefined}
        copy={selected !== undefined ? copy : undefined}
        paste={copied !== undefined ? paste : undefined}
        setSelectedId={setSelectedId}
        setUndoListener={x => setUndoListener(() => x)}
        clearRedo={clearRedo}
      />
    </HotkeysTarget2>
  );
};

export default EditWrapper;
