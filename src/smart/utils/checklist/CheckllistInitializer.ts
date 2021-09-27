import {
  addInvertedItem,
  ChecklistResult,
  ChecklistSetting,
  ChecklistTaskList,
  ChecklistUpdateList,
  createCLItem,
  EGatePath,
  EGatePathTaskList,
  getCheckListId,
} from '../../model/checklist';
import {
  EditorApproval,
  EditorEGate,
  EditorModel,
  EditorProcess,
  EditorRegistry,
  EditorSubprocess,
  isEditorApproval,
  isEditorData,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
} from '../../model/editormodel';
import { ModalityType } from '../constants';
import { calculateReach, calInitEGates } from './ChecklistCalculator';

export function calculateTaskList(
  model: EditorModel,
  setting: ChecklistSetting
): [ChecklistTaskList, EGatePathTaskList, ChecklistUpdateList] {
  const records: ChecklistTaskList = {};
  const inverted: ChecklistUpdateList = {};
  const egates: EGatePathTaskList = {};
  for (const x in model.elements) {
    const elm = model.elements[x];
    if (isEditorProcess(elm)) {
      addProcessCLItem(elm, model, setting, records, inverted, egates, new Set<string>());
    } else if (isEditorApproval(elm)) {
      addApprovalCLItem(elm, model, setting, records, inverted);
    } else if (isEditorRegistry(elm)) {
      addRegistryCLItem(elm, model, setting, records, inverted);
    }
  }
  const root = model.pages[model.root];
  const task: string[] = [];
  const rootid = '#root';
  if (root !== undefined) {
    const needed = visitNode(
      root.start,
      root,
      model,
      new Set<string>(),
      egates,
      inverted,
      new Set<string>()
    );
    for (const x of needed) {
      task.push(x);
      addInvertedItem(inverted, x, rootid);
    }
  }
  records[rootid] = createCLItem(rootid, task);
  return [records, egates, inverted];
}

function addEGateCLItem(
  egate: EditorEGate,
  page: EditorSubprocess,
  model: EditorModel,
  egates: EGatePathTaskList,
  inverted: ChecklistUpdateList,
  adding: Set<string>,
) {
  if (adding.has(egate.id)) {
    return;
  }
  adding.add(egate.id);
  const eid = getCheckListId(egate);
  const neighbor = page.neighbor[egate.id];
  const paths: EGatePath[] = [];
  if (neighbor !== undefined) {
    for (const x of neighbor) {
      const elm = model.elements[x];
      let needed: string[] = [];
      if (isEditorEgate(elm)) {
        if (elm.id !== egate.id) {
          needed.push(elm.id);
          addEGateCLItem(elm, page, model, egates, inverted, adding);
        }
      } else {
        if (isEditorProcess(elm) || isEditorApproval(elm)) {
          needed.push(elm.id);
        }
        needed = [
          ...needed,
          ...visitNode(
            x,
            page,
            model,
            new Set<string>([egate.id]),
            egates,
            inverted,
            adding
          ),
        ];
      }
      for (const x of needed) {
        addInvertedItem(inverted, x, eid);
      }
      paths.push(needed);
    }
  }
  egates[eid] = {
    id: eid,
    progress: 0,
    paths,
  };
}

function addRegistryCLItem(
  registry: EditorRegistry,
  model: EditorModel,
  setting: ChecklistSetting,
  records: ChecklistTaskList,
  inverted: ChecklistUpdateList
): void {
  const rid = getCheckListId(registry);
  const dc = model.elements[registry.data];
  const task: string[] = [];
  if (dc !== undefined && isEditorDataClass(dc)) {
    for (const x in dc.attributes) {
      const att = dc.attributes[x];
      const modality = att.modality as ModalityType;
      if (setting[modality]) {
        const aid = getCheckListId(att, dc.id);
        records[aid] = createCLItem(aid);
        task.push(aid);
        addInvertedItem(inverted, aid, rid);
      }
    }
    records[rid] = createCLItem(rid, task);
  }
}

function addApprovalCLItem(
  approval: EditorApproval,
  model: EditorModel,
  setting: ChecklistSetting,
  records: ChecklistTaskList,
  inverted: ChecklistUpdateList
): void {
  const modality = approval.modality as ModalityType;
  if (setting[modality]) {
    const pid = getCheckListId(approval);
    const task: string[] = [];

    for (const y of approval.records) {
      const data = model.elements[y];
      if (isEditorData(data)) {
        const dataid = getCheckListId(data);
        task.push(dataid);
        addInvertedItem(inverted, dataid, pid);
      }
    }
    records[pid] = createCLItem(pid, task);
  }
}

function addProcessCLItem(
  process: EditorProcess,
  model: EditorModel,
  setting: ChecklistSetting,
  records: ChecklistTaskList,
  inverted: ChecklistUpdateList,
  egates: EGatePathTaskList,
  addingEGate: Set<string>,
): void {
  const pid = getCheckListId(process);
  const task: string[] = [];
  for (const y of process.provision) {
    const pro = model.provisions[y];
    const modailty = pro.modality as ModalityType;
    if (setting[modailty]) {
      const proid = getCheckListId(pro);
      records[proid] = createCLItem(proid);
      task.push(proid);
      addInvertedItem(inverted, proid, pid);
    }
  }
  for (const y of new Set([...process.input, ...process.output])) {
    const data = model.elements[y];
    if (isEditorData(data)) {
      const dataid = getCheckListId(data);
      task.push(dataid);
      addInvertedItem(inverted, dataid, pid);
    }
  }
  if (process.page !== '') {
    const page = model.pages[process.page];
    const needed = visitNode(
      page.start,
      page,
      model,
      new Set<string>(),
      egates,
      inverted, 
      addingEGate
    );
    for (const x of needed) {
      task.push(x);
      addInvertedItem(inverted, x, pid);
    }
  }
  records[pid] = createCLItem(pid, task);
}

function visitNode(
  id: string,
  page: EditorSubprocess,
  model: EditorModel,
  visited: Set<string>,
  egates: EGatePathTaskList,
  inverted: ChecklistUpdateList,
  addingEGate: Set<string>
): string[] {
  if (visited.has(id)) {
    return [];
  }
  visited.add(id);
  let tasks: string[] = [];
  const neighbor = page.neighbor[id];
  if (neighbor !== undefined) {
    for (const x of neighbor) {
      const elm = model.elements[x];
      if (isEditorEgate(elm)) {
        tasks.push(x);
        addEGateCLItem(elm, page, model, egates, inverted, addingEGate);
      } else if (isEditorProcess(elm) || isEditorApproval(elm)) {
        tasks = [
          ...tasks,
          x,
          ...visitNode(x, page, model, visited, egates, inverted, addingEGate),
        ];
      }
    }
  }
  return tasks;
}

export function initResult(
  task: ChecklistTaskList,
  egates: EGatePathTaskList,
  inverted: ChecklistUpdateList,
  model: EditorModel
): ChecklistResult {
  const done: Record<string, number> = {};
  for (const x in task) {
    done[x] = 0;
  }
  calInitEGates(task, egates, done, inverted);
  return {
    checklist: task,
    inverted: inverted,
    egatelist: egates,
    itemsDone: done,
    reached: calculateReach(task, egates, model),
  };
}
