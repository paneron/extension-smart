import type {
  HotkeyConfig,
  IToaster } from '@blueprintjs/core';
import {
  HotkeysTarget2,
  Toaster,
} from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext } from 'react';
import { useState } from 'react';
import type { ChangeLog } from '@/smart/model/changelog';
import { addToLog } from '@/smart/model/changelog';
import type { EditorAction } from '@/smart/model/editor/state';
import { useEditorState } from '@/smart/model/editor/state';
import type { EditorModel } from '@/smart/model/editormodel';
import { isEditorProcess } from '@/smart/model/editormodel';
import { createModelHistory } from '@/smart/model/history';
import type { MMELRepo, RepoIndex } from '@/smart/model/repo';
import type { EditorState } from '@/smart/model/States';
import { addExisingProcessToPage } from '@/smart/utils/ModelAddComponentHandler';
import ModelEditor from '@/smart/ui/maineditor';

const EditWrapper: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  repo: MMELRepo;
  index: RepoIndex;
  model: EditorModel;
  changelog: ChangeLog;
}> = function (props) {
  const { model, changelog } = props;
  const { useRemoteUsername } = useContext(DatasetContext);
  const initObj: EditorState = {
    model,
    history : createModelHistory(model),
    page    : model.root,
    type    : 'model',
  };
  const [state, act, undoState, redoState, clearRedo] = useEditorState(initObj);

  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState<string | undefined>(undefined);
  const [toaster] = useState<IToaster>(Toaster.create());
  const [, setUndoListener] = useState<(() => void) | undefined>(undefined);

  const userData = useRemoteUsername();
  const username =
    userData === undefined ||
    userData.value === undefined ||
    userData.value.username === undefined
      ? 'Anonymous'
      : userData.value.username;

  const hotkeys: HotkeyConfig[] = [
    {
      combo        : 'ctrl+z',
      global       : true,
      label        : 'Undo',
      onKeyDown    : undo,
      allowInInput : true,
    },
    {
      combo        : 'ctrl+y',
      global       : true,
      label        : 'Redo',
      onKeyDown    : redo,
      allowInInput : true,
    },
    {
      combo     : 'ctrl+c',
      global    : true,
      label     : 'Copy',
      onKeyDown : copy,
    },
    {
      combo     : 'ctrl+v',
      global    : true,
      label     : 'Paste',
      onKeyDown : paste,
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
      undoState(changelog, username);
    }
  }

  function redo() {
    if (redoState) {
      redoState(changelog, username);
    }
  }

  function copy() {
    if (selected !== undefined) {
      setCopied(selected);
      toaster.show({
        message : `Process ${selected} marked`,
        intent  : 'success',
      });
    }
  }

  function performAct(x: EditorAction) {
    if (x.type === 'model') {
      addToLog(changelog, username, x);
    }
    act(x);
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
            message : `Error: ${error.message}`,
            intent  : 'danger',
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
        act={performAct}
        redo={redoState ? redo : undefined}
        undo={undoState ? undo : undefined}
        copy={selected !== undefined ? copy : undefined}
        paste={copied !== undefined ? paste : undefined}
        setSelectedId={setSelectedId}
        setUndoListener={x => setUndoListener(() => x)}
        clearRedo={clearRedo}
        changelog={changelog}
      />
    </HotkeysTarget2>
  );
};

export default EditWrapper;
