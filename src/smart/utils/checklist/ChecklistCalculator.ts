import {
  ChecklistResult,
  ChecklistTaskList,
  EGatePathTaskList,
} from '@/smart/model/checklist';
import {
  EditorModel,
  EditorSubprocess,
  isEditorApproval,
  isEditorEgate,
  isEditorProcess,
} from '@/smart/model/editormodel';

export function updateResult(
  result: ChecklistResult,
  id: string,
  progress: number,
  model: EditorModel
): ChecklistResult {
  const checklist = { ...result.checklist };
  const itemsDone = { ...result.itemsDone };
  const egatelist = { ...result.egatelist };
  const inverted = { ...result.inverted };

  const updated = setProgress(
    id,
    progress,
    checklist,
    egatelist,
    new Set<string>(),
    itemsDone
  );
  const assigned = new Set(updated); // this batch of elements should not be updated as their progresses are assigned directly
  updatePropagation(
    updated,
    assigned,
    checklist,
    egatelist,
    itemsDone,
    inverted
  );
  const reached = calculateReach(checklist, egatelist, model);

  return {
    checklist,
    itemsDone,
    egatelist,
    inverted,
    reached,
  };
}

export function calculateReach(
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  model: EditorModel
): Set<string> {
  const visited = new Set<string>();
  const root = model.pages[model.root];
  if (root !== undefined) {
    reachNode(root.start, root, model, checklist, egatelist, visited);
  }
  return visited;
}

function reachNode(
  id: string,
  page: EditorSubprocess,
  model: EditorModel,
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  visited: Set<string>
): void {
  if (visited.has(id)) {
    return;
  }
  const elm = model.elements[id];
  let ok = true;
  if (isEditorEgate(elm)) {
    const check = egatelist[elm.id];
    ok = check !== undefined && check.progress === 100;
  } else if (isEditorProcess(elm) || isEditorApproval(elm)) {
    const check = checklist[elm.id];
    ok = check !== undefined && check.progress === 100;
    if (isEditorProcess(elm) && elm.page !== '') {
      const page = model.pages[elm.page];
      reachNode(page.start, page, model, checklist, egatelist, visited);
    }
  }
  if (ok) {
    visited.add(id);
    const neighbor = page.neighbor[id];
    if (neighbor !== undefined) {
      for (const child of neighbor) {
        reachNode(child, page, model, checklist, egatelist, visited);
      }
    }
  }
}

export function calInitEGates(
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  itemsDone: Record<string, number>,
  inverted: Record<string, string[]>
) {
  const updated: string[] = [];
  for (const g in egatelist) {
    const gate = egatelist[g];
    for (const path of gate.paths) {
      if (path.length === 0) {
        gate.progress = 100;
        updated.push(g);
        break;
      }
    }
  }
  updatePropagation(
    updated,
    new Set(updated),
    checklist,
    egatelist,
    itemsDone,
    inverted
  );
}

function updatePropagation(
  changes: string[],
  ineditable: Set<string>,
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  itemsDone: Record<string, number>,
  inverted: Record<string, string[]>
): void {
  while (changes.length > 0) {
    const toupdate = new Set<string>();
    findNextUpdates(changes, toupdate, ineditable, inverted);
    changes = [];
    for (const x of toupdate) {
      if (recalculate(x, checklist, egatelist, itemsDone)) {
        changes.push(x);
      }
    }
  }
}

// return true if the progress changes
function recalculate(
  id: string,
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  itemsDone: Record<string, number>
): boolean {
  const task = checklist[id];
  if (task !== undefined) {
    let taskDone = 0;
    let progress = 0;
    for (const x of task.tasks) {
      const g = getProgress(x, checklist, egatelist);
      if (g === 100) {
        taskDone++;
      }
      progress += g;
    }
    const overall = task.tasks.length !== 0 ? progress / task.tasks.length : 0;
    itemsDone[id] = taskDone;
    if (task.progress !== overall) {
      task.progress = overall;
      return true;
    }
    return false;
  }
  const egate = egatelist[id];
  if (egate !== undefined) {
    let best = 0;
    for (const path of egate.paths) {
      let total = 0;
      for (const x of path) {
        total += getProgress(x, checklist, egatelist);
      }
      const progress = path.length !== 0 ? total / path.length : 100;
      if (best < progress) {
        best = progress;
      }
    }
    if (egate.progress !== best) {
      egate.progress = best;
      return true;
    }
  }
  return false;
}

function getProgress(
  id: string,
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList
): number {
  const task = checklist[id];
  if (task !== undefined) {
    return task.progress;
  }
  const egate = egatelist[id];
  if (egate !== undefined) {
    return egate.progress;
  }
  return 0;
}

function findNextUpdates(
  changes: string[],
  toupdate: Set<string>,
  assigned: Set<string>,
  inverted: Record<string, string[]>
): void {
  for (const x of changes) {
    const list = inverted[x];
    if (list !== undefined) {
      for (const y of list) {
        if (!assigned.has(y)) {
          toupdate.add(y);
        }
      }
    }
  }
}

function setProgress(
  id: string,
  x: number,
  checklist: ChecklistTaskList,
  egatelist: EGatePathTaskList,
  visited: Set<string>,
  itemsDone: Record<string, number>
): string[] {
  if (visited.has(id)) {
    return [];
  }
  visited.add(id);
  const task = checklist[id];
  if (task !== undefined) {
    task.progress = x;
    itemsDone[id] = x === 100 ? task.tasks.length : 0;
    let ret: string[] = [id];
    for (const child of task.tasks) {
      ret = [
        ...ret,
        ...setProgress(child, x, checklist, egatelist, visited, itemsDone),
      ];
    }
    return ret;
  }
  const egate = egatelist[id];
  if (egate !== undefined) {
    egate.progress = x;
    let ret: string[] = [id];
    for (const path of egate.paths) {
      for (const child of path) {
        ret = [
          ...ret,
          ...setProgress(child, x, checklist, egatelist, visited, itemsDone),
        ];
      }
    }
    return ret;
  }
  return [];
}
