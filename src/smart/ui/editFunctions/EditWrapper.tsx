import {
  HotkeysProvider,
  HotkeysTarget2,
  IToaster,
  Toaster,
} from '@blueprintjs/core';
import React from 'react';
import { useState } from 'react';
import {
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorNode,
  isEditorPage,
  isEditorProcess,
} from '../../model/editormodel';
import {
  createPageHistory,
  EditHistory,
  PageHistory,
} from '../../model/history';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { EditorState } from '../../model/States';
import { MMELObject } from '../../serialize/interface/baseinterface';
import { MMELEnum } from '../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
  MMELVariable,
  MMELView,
} from '../../serialize/interface/supportinterface';
import { createNewEditorModel } from '../../utils/EditorFactory';
import { addExisingProcessToPage } from '../../utils/ModelAddComponentHandler';
import ModelEditor from '../maineditor';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const EditWrapper: React.FC<{
  isVisible: boolean;
  className?: string;
  setClickListener: (f: (() => void)[]) => void;
  repo?: MMELRepo;
  isBSI: boolean;
  index: RepoIndex;
}> = function (props) {
  const [state, setState] = useState<EditorState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
    edgeDeleteVisible: false,
  });

  const [history, setHistory] = useState<EditHistory>({ past: [], future: [] });
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
    if (requireHistory) {
      if (history.past.length < 500) {
        setHistory({
          past: [...history.past, getEditHistory(state)],
          future: [],
        });
      } else {
        setHistory({
          past: [...history.past.slice(1), getEditHistory(state)],
          future: [],
        });
      }
    }
    setState(newState);
  }

  function redo() {
    const { past, future } = history;
    const s = future.pop();
    if (s !== undefined) {
      setState({ ...state, modelWrapper: s.mw, history: s.phistory });
      setHistory({
        past: [...past, getEditHistory(state)],
        future: [...future],
      });
    }
  }

  function undo() {
    const { past, future } = history;
    const s = past.pop();
    if (s !== undefined) {
      setState({ ...state, modelWrapper: s.mw, history: s.phistory });
      setHistory({
        past: [...past],
        future: [...future, getEditHistory(state)],
      });
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
      const elm = state.modelWrapper.model.elements[id];
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
      const mw = state.modelWrapper;
      const model = mw.model;
      const elm = model.elements[copied];
      if (elm !== undefined) {
        try {
          const newModel = addExisingProcessToPage(
            model,
            state.history,
            mw.page,
            elm.id
          );
          updateState(
            { ...state, modelWrapper: { ...mw, model: newModel } },
            true
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
    <HotkeysProvider>
      <HotkeysTarget2 hotkeys={hotkeys}>
        <ModelEditor
          {...props}
          state={{
            ...state,
            modelWrapper: deepCopyMW(state.modelWrapper),
            history: deepCopyHistory(state.history),
          }}
          setState={updateState}
          redo={history.future.length > 0 ? redo : undefined}
          undo={history.past.length > 0 ? undo : undefined}
          copy={selected !== undefined ? copy : undefined}
          paste={copied !== undefined ? paste : undefined}
          setSelectedId={setSelectedId}
          isBSIEnabled={props.isBSI}
          resetHistory={() => setHistory({ past: [], future: [] })}
        />
      </HotkeysTarget2>
    </HotkeysProvider>
  );
};

function getEditHistory(s: EditorState) {
  return { mw: s.modelWrapper, phistory: s.history };
}

function deepCopyHistory(history: PageHistory): PageHistory {
  return { items: history.items.map(x => ({ ...x })) };
}

function deepCopyMW(mw: ModelWrapper): ModelWrapper {
  return { ...mw, model: deepCopyModel(mw.model) };
}

function deepCopyModel(model: EditorModel): EditorModel {
  return {
    ...model,
    elements: deepCopyElements<EditorNode>(model.elements),
    enums: deepCopyElements<MMELEnum>(model.enums),
    meta: { ...model.meta },
    pages: deepCopyElements<EditorSubprocess>(model.pages),
    provisions: deepCopyElements<MMELProvision>(model.provisions),
    refs: deepCopyElements<MMELReference>(model.refs),
    roles: deepCopyElements<MMELRole>(model.roles),
    vars: deepCopyElements<MMELVariable>(model.vars),
    views: deepCopyElements<MMELView>(model.views),
  };
}

function deepCopyElements<T extends MMELObject>(
  x: Record<string, T>
): Record<string, T> {
  const nx: Record<string, T> = {};
  for (const key in x) {
    nx[key] = deepCopyElement(x[key]);
  }
  return nx;
}

function deepCopyElement<T extends MMELObject>(x: T): T {
  const nx = { ...x };
  if (isEditorPage(nx)) {
    nx.childs = { ...nx.childs };
    nx.data = { ...nx.data };
    nx.edges = { ...nx.edges };
    nx.neighbor = { ...nx.neighbor };
  }
  if (isEditorNode(nx) && isEditorProcess(nx)) {
    nx.input = new Set(nx.input);
    nx.output = new Set(nx.output);
    nx.measure = [...nx.measure];
    nx.pages = new Set(nx.pages);
    nx.provision = new Set(nx.provision);
  }
  return nx;
}

export default EditWrapper;
