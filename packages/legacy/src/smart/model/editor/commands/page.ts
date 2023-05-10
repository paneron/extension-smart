/**
 * This file centralizes the commands related to page (subprocess)
 */

import { Node } from 'react-flow-renderer';
import { createEdge } from '../../../utils/EditorFactory';
import { findUniqueID } from '../../../utils/ModelFunctions';
import { EditorModel, EditorSubprocess, isEditorData } from '../../editormodel';
import { ModelAction } from '../model';

/**
 * Remove an edge of a subprocess (page)
 * @param page The page ID
 * @param id The edge ID
 */
export function removeEdgeCommand(page: string, id: string) {
  const action: ModelAction = {
    type  : 'model',
    act   : 'pages',
    task  : 'delete-edge',
    value : [id],
    page,
  };
  return action;
}

/**
 * Add an edge to the subprocess (page)
 * @param page The page ID
 * @param source The element ID of the edge source
 * @param target The element ID of the edge target
 */
export function newEdgeCommand(
  page: EditorSubprocess,
  source: string,
  target: string
) {
  const newEdge = createEdge(findUniqueID('Edge', page.edges));
  newEdge.from = source;
  newEdge.to = target;
  const action: ModelAction = {
    type  : 'model',
    act   : 'pages',
    task  : 'new-edge',
    value : [newEdge],
    page  : page.id,
  };
  return action;
}

interface DragStartRecord {
  x: number;
  y: number;
}

/**
 * The element is moved on the page
 * @param page The page ID
 * @param model The current model
 * @param flowNode The node (React flow Node type) that is moved
 * @param ds The start location of the move
 */
export function dragCommand(
  page: string,
  model: EditorModel,
  flowNode: Node,
  ds: DragStartRecord
) {
  const action: ModelAction = {
    type     : 'model',
    act      : 'pages',
    task     : 'move',
    page     : page,
    node     : flowNode.id,
    nodetype : isEditorData(model.elements[flowNode.id]) ? 'data' : 'node',
    x        : flowNode.position.x,
    y        : flowNode.position.y,
    fromx    : ds.x,
    fromy    : ds.y,
  };
  return action;
}
