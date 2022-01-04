import { Node } from 'react-flow-renderer';
import { createEdge } from '../../../utils/EditorFactory';
import { findUniqueID } from '../../../utils/ModelFunctions';
import { EditorModel, EditorSubprocess, isEditorData } from '../../editormodel';
import { ModelAction } from '../model';

export function removeEdgeCommand(page: string, id: string) {
  const action: ModelAction = {
    type: 'model',
    act: 'pages',
    task: 'delete-edge',
    value: id,
    page,
  };
  return action;
}

export function newEdgeCommand(
  page: EditorSubprocess,
  source: string,
  target: string
) {
  const newEdge = createEdge(findUniqueID('Edge', page.edges));
  newEdge.from = source;
  newEdge.to = target;
  const action: ModelAction = {
    type: 'model',
    act: 'pages',
    task: 'new-edge',
    value: newEdge,
    page: page.id,
  };
  return action;
}

type DragStartRecord = {
  x: number;
  y: number;
};

export function dragCommand(
  page: string,
  model: EditorModel,
  flowNode: Node,
  ds: DragStartRecord
) {
  const action: ModelAction = {
    type: 'model',
    act: 'pages',
    task: 'move',
    page: page,
    node: flowNode.id,
    nodetype: isEditorData(model.elements[flowNode.id]) ? 'data' : 'node',
    x: flowNode.position.x,
    y: flowNode.position.y,
    fromx: ds.x,
    fromy: ds.y,
  };
  return action;
}
