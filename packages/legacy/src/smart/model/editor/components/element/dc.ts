import { MMELSubprocess } from '../../../../serialize/interface/flowcontrolinterface';
import { fillRDCS } from '../../../../utils/ModelFunctions';
import {
  EditorDataClass,
  EditorNode,
  isEditorDataClass,
} from '../../../editormodel';
import { ModelAction } from '../../model';
import { ElmAction, DataCascadeDCID } from '../elements';

/**
 * Add a new data class
 * @param elms The elements in the model
 * @param dcs The new data classes
 * @returns The updated elements in the model
 */
export function addDC(
  elms: Record<string, EditorNode>,
  dcs: EditorNode[]
): Record<string, EditorNode> {
  for (const item of dcs) {
    const dc = item as EditorDataClass;
    elms[dc.id] = { ...dc };
    fillRDCS(dc, elms);
  }
  return elms;
}

/**
 * Edit a data class
 * @param elms The elements in the model
 * @param id The ID of the data class to be edited
 * @param item The updated content of the data class
 * @returns The updated elements in the model
 */
export function editDC(
  elms: Record<string, EditorNode>,
  id: string,
  item: EditorNode
): Record<string, EditorNode> {
  delete elms[id];
  const dc = item as EditorDataClass;
  elms[dc.id] = { ...dc };
  fillRDCS(dc, elms);
  return elms;
}

/**
 * Examine the action about data and add cascade actions if necessary
 * @param elms The elements in the model
 * @param pages The pages in the model
 * @param action The action
 * @returns The cascade actions for undo
 */
export function cascadeCheckDCs(
  elms: Record<string, EditorNode>,
  pages: Record<string, MMELSubprocess>,
  action: ElmAction & {
    act: 'elements';
    subtask: 'dc';
  }
): ModelAction[] | undefined {
  if (action.cascade) {
    return undefined;
  }
  if (action.task === 'delete') {
    const affected: [DataCascadeDCID[], [string, number, number][], string][] =
      action.value.map(x => [...findAffectedElements(elms, pages, x, ''), x]);
    action.cascade = affected.flatMap(([ids, pids, id]) => [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-dc',
        to      : undefined,
        from    : id,
        ids,
      },
      {
        type    : 'model',
        act     : 'pages',
        task    : 'cascade',
        subtask : 'data',
        to      : undefined,
        from    : id,
        ids     : pids,
      },
    ]);
    return affected.flatMap(([ids, pids, id]) => [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-dc',
        from    : undefined,
        to      : id,
        ids     : ids.map(x => reverseAttribute(x, elms)),
      },
      {
        type    : 'model',
        act     : 'pages',
        task    : 'cascade',
        subtask : 'data',
        from    : undefined,
        to      : id,
        ids     : pids,
      },
    ]);
  } else if (action.task === 'edit') {
    const [ids, pids] = findAffectedElements(
      elms,
      pages,
      action.id,
      action.value.id
    );
    action.cascade = [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-dc',
        from    : action.id,
        to      : action.value.id,
        ids,
      },
      {
        type    : 'model',
        act     : 'pages',
        task    : 'cascade',
        subtask : 'data',
        from    : action.id,
        to      : action.value.id,
        ids     : pids,
      },
    ];
    return [
      {
        type    : 'model',
        act     : 'elements',
        task    : 'cascade',
        subtask : 'process-dc',
        to      : action.id,
        from    : action.value.id,
        ids     : ids.map(x => reverseAttribute(x, elms)),
      },
      {
        type    : 'model',
        act     : 'pages',
        task    : 'cascade',
        subtask : 'data',
        to      : action.id,
        from    : action.value.id,
        ids     : pids,
      },
    ];
  }
  return [];
}

/**
 * Internal function to find affected elements due to the change on data
 */
function findAffectedElements(
  elms: Record<string, EditorNode>,
  pages: Record<string, MMELSubprocess>,
  id: string,
  newdc: string
): [DataCascadeDCID[], [string, number, number][]] {
  const ids: DataCascadeDCID[] = [];
  const pids: [string, number, number][] = [];

  for (const x in elms) {
    const elm = elms[x];
    if (isEditorDataClass(elm)) {
      if (elm.rdcs.has(id)) {
        const rdcs: [string, string][] = [[id, newdc]];
        const attributes: [string, string][] = [];
        for (const a in elm.attributes) {
          const att = elm.attributes[a];
          if (att.type === id) {
            attributes.push([a, newdc]);
          }
        }
        ids.push({
          id   : x,
          type : 'dc',
          attributes,
          rdcs,
        });
      }
    }
  }
  for (const p in pages) {
    const page = pages[p];
    const data = page.data[id];
    if (data) {
      pids.push([p, data.x, data.y]);
    }
  }
  return [ids, pids];
}

/**
 * Generate the undo action
 */
function reverseAttribute(
  item: DataCascadeDCID,
  elms: Record<string, EditorNode>
): DataCascadeDCID {
  const dc = elms[item.id];
  if (isEditorDataClass(dc)) {
    return {
      id         : item.id,
      type       : 'dc',
      attributes : item.attributes.map(([aid]) => [
        aid,
        dc.attributes[aid].type,
      ]),
      rdcs : item.rdcs.map(([a, b]) => [b, a]),
    };
  }
  return item;
}
