import React from 'react';
import { CSSROOTVARIABLES } from '../../../css/root.css';
import { flow_node__highlighed } from '../../../css/visual';
import { ChecklistPackage } from '../../model/checklist';
import { EditorModel } from '../../model/editormodel';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import CheckListAddon from '../../ui/checklist/CheckListAddon';

const okcolor = 'lightgreen';
const normalcolor = CSSROOTVARIABLES['--plain-node-color'];

export function getCheckListView(
  result: ChecklistPackage,
  CustomAttribute: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    data: unknown;
    dcid: string;
  }>,
  CustomProvision: React.FC<{
    provision: MMELProvision;
    getRefById?: (id: string) => MMELReference | null;
    data: unknown;
  }>,
  getEdgeColor: (id: string, pageid: string, data: unknown) => string,
  isEdgeAnimated: (id: string, pageid: string, data: unknown) => boolean
): ViewFunctionInterface {
  return {
    getStyleById,
    getSVGColorById,
    data: result,
    NodeAddon: CheckListAddon,
    CustomAttribute,
    CustomProvision,
    getEdgeColor,
    isEdgeAnimated,
  };
}

function getStyleById(id: string, _: string, data: unknown) {
  const pack = data as ChecklistPackage;
  const result = pack.result;
  const item = result.checklist[id];
  if (item !== undefined) {
    return flow_node__highlighed(item.progress === 100 ? okcolor : normalcolor);
  }
  return flow_node__highlighed(normalcolor);
}

function getSVGColorById(id: string, _: string, data: unknown): string {
  const pack = data as ChecklistPackage;
  const result = pack.result;
  const item = result.checklist[id];
  if (item !== undefined) {
    return item.progress === 100 ? okcolor : 'none';
  }
  const egate = result.egatelist[id];
  if (egate !== undefined) {
    return egate.progress === 100 ? okcolor : 'none';
  }
  return 'none';
}

export function calEdgeAnimated(
  id: string,
  pageid: string,
  pack: ChecklistPackage,
  model: EditorModel
): boolean {
  const page = model.pages[pageid];
  const edge = page.edges[id];
  const from = edge.from;
  const to = edge.to;
  const reached = pack.result.reached;
  return reached.has(from) && reached.has(to);
}

export function calEdgeColor(
  id: string,
  pageid: string,
  pack: ChecklistPackage,
  model: EditorModel
): string {
  const page = model.pages[pageid];
  const edge = page.edges[id];
  const from = edge.from;
  const to = edge.to;
  const reached = pack.result.reached;
  if (reached.has(from) && reached.has(to)) {
    return 'green';
  }
  return CSSROOTVARIABLES['--colour--black'];
}
