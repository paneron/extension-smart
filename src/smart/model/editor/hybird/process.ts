import { createNewPage } from '../../../utils/ModelAddComponentHandler';
import { EditorModel, EditorProcess, isEditorProcess } from '../../editormodel';
import { ModelAction } from '../model';
import { HyEditAction } from './distributor';

type ProcessAddPageHybird = HyEditAction & { task: 'process-add-page' };
type ProcessRemovePageHybird = HyEditAction & { task: 'process-remove-page' };
type ProcessEditHybird = HyEditAction & { task: 'process-edit' };
type ProcessBringoutHybird = HyEditAction & { task: 'process-bringout' };
type ProcessBringInHybird = HyEditAction & { task: 'process-bringin' };
type ProcessDeleteHybird = HyEditAction & { task: 'process-delete' };
type ProcessDeleteReverseHybird = HyEditAction & {
  task: 'process-delete-reverse';
};

export function compileProcessAddPage(
  action: ProcessAddPageHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseAddPageAction(action);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const [page, start] = createNewPage(model);
    const newProcess: EditorProcess = { ...elm, page: page.id };
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: newProcess,
      },
      {
        type: 'model',
        act: 'elements',
        task: 'add',
        subtask: 'flowunit',
        value: [start],
      },
      {
        type: 'model',
        act: 'pages',
        task: 'new-page',
        value: [page],
      },
    ];
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      ract.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.id,
          value: elm,
        },
        {
          type: 'model',
          act: 'elements',
          task: 'delete',
          subtask: 'flowunit',
          value: [start.id],
        },
        {
          type: 'model',
          act: 'pages',
          task: 'delete-page',
          value: [page.id],
        },
      ];
    }
  }
  return ract;
}

function reverseAddPageAction(action: ProcessAddPageHybird): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-remove-page',
    id: action.id,
  };
}

export function compileProcessRemovePage(
  action: ProcessRemovePageHybird,
  model: EditorModel
): ModelAction | undefined {
  const ract = reverseRemovePageAction(action);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const waiting: Record<string, EditorProcess> = {};
    const delElm: string[] = [];
    const delPage: string[] = [];
    const delProvs: string[] = [];
    const delNotes: string[] = [];
    const delLinks: string[] = [];
    const newProcess: EditorProcess = { ...elm, page: '' };
    checkRemovePage(
      model,
      elm.page,
      waiting,
      delElm,
      delPage,
      delProvs,
      delNotes,
      delLinks
    );
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: newProcess,
      },
      {
        type: 'model',
        act: 'elements',
        task: 'delete',
        subtask: 'flowunit',
        value: delElm,
      },
      {
        type: 'model',
        act: 'pages',
        task: 'delete-page',
        value: delPage,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'replace',
        from: delProvs,
        to: [],
      },
      {
        type: 'model',
        act: 'notes',
        task: 'replace',
        from: delNotes,
        to: [],
      },
      {
        type: 'model',
        act: 'link',
        task: 'replace',
        from: delLinks,
        to: [],
      },
    ];
    for (const w of Object.values(waiting)) {
      const newAct: ModelAction = {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: w.id,
        value: w,
      };
      actions.push(newAct);
    }
    action.actions = actions;
    if (ract && ract.act === 'hybird') {
      ract.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.id,
          value: model.elements[action.id],
        },
        {
          type: 'model',
          act: 'elements',
          task: 'add',
          subtask: 'flowunit',
          value: delElm.map(x => model.elements[x]),
        },
        {
          type: 'model',
          act: 'pages',
          task: 'new-page',
          value: delPage.map(x => model.pages[x]),
        },
        {
          type: 'model',
          act: 'provision',
          task: 'replace',
          from: [],
          to: delProvs.map(x => model.provisions[x]),
        },
        {
          type: 'model',
          act: 'notes',
          task: 'replace',
          from: [],
          to: delNotes.map(x => model.notes[x]),
        },
        {
          type: 'model',
          act: 'link',
          task: 'replace',
          from: [],
          to: delLinks.map(x => model.links[x]),
        },
      ];
      for (const w of Object.values(waiting)) {
        const newAct: ModelAction = {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: w.id,
          value: model.elements[w.id],
        };
        ract.actions.push(newAct);
      }
    }
  }
  return ract;
}

function reverseRemovePageAction(action: ProcessRemovePageHybird): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-add-page',
    id: action.id,
  };
}

export function compileProcessEdit(
  action: ProcessEditHybird,
  model: EditorModel
): ModelAction | undefined {
  const reverse = reverseProcessEditAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: action.process,
      },
      {
        type: 'model',
        act: 'provision',
        task: 'replace',
        from: [...elm.provision],
        to: action.provisions,
      },
      {
        type: 'model',
        act: 'notes',
        task: 'replace',
        from: [...elm.notes],
        to: action.notes,
      },
      {
        type: 'model',
        act: 'link',
        task: 'replace',
        from: [...elm.links],
        to: action.links,
      },
      {
        type: 'model',
        act: 'refs',
        task: 'add',
        value: action.newRefs,
        cascade: [],
      },
    ];
    action.actions = actions;
    if (reverse && reverse.act === 'hybird') {
      reverse.actions = [
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.process.id,
          value: elm,
        },
        {
          type: 'model',
          act: 'provision',
          task: 'replace',
          from: action.provisions.map(x => x.id),
          to: [...elm.provision].map(x => model.provisions[x]),
        },
        {
          type: 'model',
          act: 'notes',
          task: 'replace',
          from: action.notes.map(x => x.id),
          to: [...elm.notes].map(x => model.notes[x]),
        },
        {
          type: 'model',
          act: 'link',
          task: 'replace',
          from: action.links.map(x => x.id),
          to: [...elm.links].map(x => model.links[x]),
        },
        {
          type: 'model',
          act: 'refs',
          task: 'delete',
          value: action.newRefs.map(x => x.id),
          cascade: [],
        },
      ];
    }
  }
  return reverse;
}

export function compileProcessBringout(
  action: ProcessBringoutHybird,
  model: EditorModel
): ModelAction | undefined {
  const reverse = reverseProcessBringOutAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const updated = { ...elm };
    updated.pages = new Set([...elm.pages]);
    updated.pages.delete(action.page);
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'pages',
        task: 'remove-child',
        ids: [action.id],
        page: action.page,
      },
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: updated,
      },
    ];
    action.actions = actions;
    if (reverse && reverse.act === 'hybird') {
      const page = model.pages[action.page];
      const compo = page.childs[action.id];
      const actions: ModelAction[] = [
        {
          type: 'model',
          act: 'pages',
          task: 'add-child',
          ids: [[action.id, compo.x, compo.y]],
          page: action.page,
        },
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.id,
          value: elm,
        },
      ];
      reverse.actions = actions;
    }
  }
  return reverse;
}

export function compileProcessBringin(
  action: ProcessBringInHybird,
  model: EditorModel
): ModelAction | undefined {
  // Logger.log('Performing action', action);
  const reverse = reverseProcessBringInAction(action, model);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    const updated = { ...elm };
    updated.pages = new Set([...elm.pages, action.page]);
    const actions: ModelAction[] = [
      {
        type: 'model',
        act: 'pages',
        task: 'add-child',
        ids: [[action.id, 0, 0]],
        page: action.page,
      },
      {
        type: 'model',
        act: 'elements',
        task: 'edit',
        subtask: 'flowunit',
        id: action.id,
        value: updated,
      },
    ];
    action.actions = actions;
    // Logger.log('Actual actions', action.actions);
    if (reverse && reverse.act === 'hybird') {
      const actions: ModelAction[] = [
        {
          type: 'model',
          act: 'pages',
          task: 'remove-child',
          ids: [action.id],
          page: action.page,
        },
        {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: action.id,
          value: elm,
        },
      ];
      reverse.actions = actions;
    }
  }
  return reverse;
}

function reverseProcessBringInAction(
  action: ProcessBringInHybird,
  model: EditorModel
): ModelAction {
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm)) {
    return {
      type: 'model',
      act: 'hybird',
      task: 'process-bringout',
      id: action.id,
      page: action.page,
    };
  }
  throw new Error(`Process with ${action.id} not found`);
}

function reverseProcessBringOutAction(
  action: ProcessBringoutHybird,
  model: EditorModel
): ModelAction {
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm)) {
    return {
      type: 'model',
      act: 'hybird',
      task: 'process-bringin',
      id: action.id,
      page: action.page,
    };
  }
  throw new Error(`Process with ${action.id} not found`);
}

function reverseProcessEditAction(
  action: ProcessEditHybird,
  model: EditorModel
): ModelAction {
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm)) {
    return {
      type: 'model',
      act: 'hybird',
      task: 'process-edit',
      id: action.process.id,
      process: elm,
      provisions: [...elm.provision].map(x => model.provisions[x]),
      notes: [...elm.notes].map(x => model.notes[x]),
      links: [...elm.links].map(x => model.links[x]),
      newRefs: action.delRefs.map(x => model.refs[x]),
      delRefs: action.newRefs.map(x => x.id),
    };
  }
  throw new Error(`Process with ${action.id} not found`);
}

function checkRemovePage(
  model: EditorModel,
  pageid: string,
  waiting: Record<string, EditorProcess>,
  delElm: string[],
  delPage: string[],
  delPros: string[],
  delNotes: string[],
  delLinks: string[]
) {
  delPage.push(pageid);
  const page = model.pages[pageid];
  for (const c of Object.values(page.childs)) {
    const elm = model.elements[c.element];
    if (isEditorProcess(elm)) {
      const original = waiting[elm.id] ?? elm;
      const process = { ...original, pages: new Set([...original.pages]) };
      process.pages.delete(pageid);
      if (process.pages.size === 0) {
        delElm.push(process.id);
        delete waiting[process.id];
        if (process.page !== '') {
          checkRemovePage(
            model,
            process.page,
            waiting,
            delElm,
            delPage,
            delPros,
            delNotes,
            delLinks
          );
        }
      } else {
        waiting[process.id] = process;
      }
      for (const x of process.provision) {
        delPros.push(x);
      }
      for (const x of process.notes) {
        delNotes.push(x);
      }
      for (const x of process.links) {
        delLinks.push(x);
      }
    } else {
      delElm.push(elm.id);
    }
  }
}

export function compileProcessDelete(
  action: ProcessDeleteHybird,
  model: EditorModel,
  pageid: string
): ModelAction | undefined {
  const ract = reverseProcessDeleteAction(action);
  const elm = model.elements[action.id];
  if (elm && isEditorProcess(elm) && action.actions === undefined) {
    if (elm.page === '') {
      action.actions = [
        {
          type: 'model',
          act: 'pages',
          task: 'delete-element',
          value: elm,
          page: pageid,
        },
      ];
      if (ract && ract.act === 'hybird') {
        const compo = model.pages[pageid].childs[elm.id];
        ract.actions = [
          {
            type: 'model',
            act: 'pages',
            task: 'new-element',
            value: elm,
            page: pageid,
            x: compo.x,
            y: compo.y,
          },
        ];
      }
    } else {
      const waiting: Record<string, EditorProcess> = {};
      const delElm: string[] = [];
      const delPage: string[] = [];
      const delProvs: string[] = [];
      const delNotes: string[] = [];
      const delLinks: string[] = [];
      checkRemovePage(
        model,
        elm.page,
        waiting,
        delElm,
        delPage,
        delProvs,
        delNotes,
        delLinks
      );

      const actions: ModelAction[] = [
        {
          type: 'model',
          act: 'pages',
          task: 'delete-element',
          value: elm,
          page: pageid,
        },
        {
          type: 'model',
          act: 'elements',
          task: 'delete',
          subtask: 'flowunit',
          value: delElm,
        },
        {
          type: 'model',
          act: 'pages',
          task: 'delete-page',
          value: delPage,
        },
        {
          type: 'model',
          act: 'provision',
          task: 'replace',
          from: delProvs,
          to: [],
        },
        {
          type: 'model',
          act: 'notes',
          task: 'replace',
          from: delNotes,
          to: [],
        },
        {
          type: 'model',
          act: 'link',
          task: 'replace',
          from: delLinks,
          to: [],
        },
      ];
      for (const w of Object.values(waiting)) {
        const newAct: ModelAction = {
          type: 'model',
          act: 'elements',
          task: 'edit',
          subtask: 'flowunit',
          id: w.id,
          value: w,
        };
        actions.push(newAct);
      }
      action.actions = actions;
      if (ract && ract.act === 'hybird') {
        const compo = model.pages[pageid].childs[elm.id];
        ract.actions = [
          {
            type: 'model',
            act: 'pages',
            task: 'new-element',
            value: elm,
            page: pageid,
            x: compo.x,
            y: compo.y,
          },
          {
            type: 'model',
            act: 'elements',
            task: 'add',
            subtask: 'flowunit',
            value: delElm.map(x => model.elements[x]),
          },
          {
            type: 'model',
            act: 'pages',
            task: 'new-page',
            value: delPage.map(x => model.pages[x]),
          },
          {
            type: 'model',
            act: 'provision',
            task: 'replace',
            from: [],
            to: delProvs.map(x => model.provisions[x]),
          },
          {
            type: 'model',
            act: 'notes',
            task: 'replace',
            from: [],
            to: delNotes.map(x => model.notes[x]),
          },
          {
            type: 'model',
            act: 'link',
            task: 'replace',
            from: [],
            to: delLinks.map(x => model.links[x]),
          },
        ];
        for (const w of Object.values(waiting)) {
          const newAct: ModelAction = {
            type: 'model',
            act: 'elements',
            task: 'edit',
            subtask: 'flowunit',
            id: w.id,
            value: model.elements[w.id],
          };
          ract.actions.push(newAct);
        }
      }
    }
  }
  return ract;
}

function reverseProcessDeleteAction(action: ProcessDeleteHybird): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-delete-reverse',
    page: action.page,
    id: action.id,
  };
}

export function compileProcessDeleteReverse(
  action: ProcessDeleteReverseHybird
): ModelAction {
  return {
    type: 'model',
    act: 'hybird',
    task: 'process-delete',
    page: action.page,
    id: action.id,
  };
}
