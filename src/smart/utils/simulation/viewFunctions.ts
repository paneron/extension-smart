import { CSSROOTVARIABLES } from '@/css/root.css';
import { flow_node__highlighed } from '@/css/visual';
import type { SimulationState } from '@/smart/model/simulation';
import type { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';

const selectedcolor = 'lightyellow';
const normalcolor = CSSROOTVARIABLES['--plain-node-color'];

export function getSimulationView(
  result: SimulationState
): ViewFunctionInterface {
  return {
    getStyleById,
    getSVGColorById,
    data               : result,
    navigationEnabled  : false,
    navigationErrorMsg : 'Please turn off simulation for free navigation',
  };
}

function getStyleById(id: string, pageid: string, data: unknown) {
  const { spageid, sid } = data as SimulationState;
  if (spageid === pageid && sid === id) {
    return flow_node__highlighed(selectedcolor);
  }
  return flow_node__highlighed(normalcolor);
}

function getSVGColorById(id: string, pageid: string, data: unknown): string {
  const { spageid, sid } = data as SimulationState;
  if (spageid === pageid && sid === id) {
    return selectedcolor;
  }
  return 'none';
}
