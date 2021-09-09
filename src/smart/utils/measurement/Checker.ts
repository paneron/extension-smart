import { IToastProps } from '@blueprintjs/core';
import { flow_node__highlighed, no_highlight } from '../../../css/visual';
import {
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorEgate,
  isEditorProcess,
} from '../../model/editormodel';
import {
  EnviromentValues,
  EnviromentVariables,
  MeasureResult,
  MeasureRType,
  MTestReport,
} from '../../model/Measurement';
import { LegendInterface } from '../../model/States';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import { VarType } from '../../serialize/interface/supportinterface';
import MeasurementTooltip from '../../ui/measurement/MeasurementTooltip';
import { buildEdgeConnections } from '../ModelFunctions';
import { evaluateCondition, resolveMTNode } from './Evaluator';
import { parseMeasurement } from './Parser';

export const MeasureResultStyles: Record<MeasureRType, LegendInterface> = {
  [MeasureRType.OK]: { label: 'OK: Test passed', color: 'lightgreen' },
  [MeasureRType.NOTEST]: { label: 'OK: No test', color: 'lightblue' },
  [MeasureRType.ERRORSOURCE]: { label: 'Test failed', color: '#E9967A' },
  [MeasureRType.CONTAINERROR]: {
    label: 'Component failed',
    color: 'lightyellow',
  },
};

export function checkModelMeasurement(model: EditorModel, nums: EnviromentValues):MeasureResult {
  const parsedTrees = parseAllDerived(model, nums);  
  fillValues(parsedTrees, nums);  
  const result = computeResult(model, nums);
  return result;
}

export function updateView(result: MeasureResult, setView: (view: ViewFunctionInterface) => void) {
  setView({
    getStyleById,
    getSVGColorById,
    legendList: MeasureResultStyles,
    data: result,
    ComponentToolTip: MeasurementTooltip,
  });
}

export function measureTest(
  model: EditorModel,
  values: Record<string, string>,
  setView: (view: ViewFunctionInterface) => void,
  showMsg: (msg: IToastProps) => void
): void {
  const nums: EnviromentValues = {};
  for (const x in values) {
    const text = values[x];
    const parsed: number[] = text.split(',').map(t => parseFloat(t));
    nums[x] = parsed;
  }

  try {    
    const result = checkModelMeasurement(model, nums);
    if (result.overall) {
      showMsg({
        message: 'Test passed',
        intent: 'success',
      });
    } else {
      showMsg({
        message: 'Test failed',
        intent: 'danger',
      });
    }

    updateView(result, setView);    
  } catch (e: unknown) {
    alert(e);
  }
}

function getStyleById(id: string, pageid: string, data: unknown) {
  const result = data as MeasureResult;
  const pageresult = result.items[pageid] ?? {};
  const componentresult = pageresult[id];
  if (componentresult === undefined) {
    return no_highlight;
  }
  return flow_node__highlighed(MeasureResultStyles[componentresult].color);
}

function getSVGColorById(id: string, pageid: string, data: unknown) {
  const result = data as MeasureResult;
  const pageresult = result.items[pageid] ?? {};
  const componentresult = pageresult[id];
  if (componentresult === undefined) {
    return 'none';
  }
  return MeasureResultStyles[componentresult].color;
}

function parseAllDerived(
  model: EditorModel,
  values: EnviromentValues
): EnviromentVariables {
  const transformed: EnviromentVariables = {};
  for (const v of Object.values(model.vars)) {
    if (v.type !== VarType.DATA && v.type !== VarType.LISTDATA) {
      transformed[v.id] = parseMeasurement(v.definition);
    } else {
      if (values[v.id] === undefined) {
        values[v.id] = [0];
      }
    }
  }
  return transformed;
}

function fillValues(trees: EnviromentVariables, values: EnviromentValues) {
  for (const x in trees) {
    const tree = trees[x];
    const resolved = resolveMTNode(tree, values, trees);
    values[x] = resolved.value;
  }
}

function computeResult(
  model: EditorModel,
  values: EnviromentValues
): MeasureResult {
  const root = model.pages[model.root];
  const items: Record<string, Record<string, MeasureRType>> = {};
  if (root !== undefined) {
    const snode = model.elements[root.start];
    const reports: Record<string, MTestReport> = {};
    items[model.root] = {};
    const ret = computeNode(
      snode,
      model,
      root,
      buildEdgeConnections(root),
      values,
      items,
      items[model.root],
      {},
      {},
      reports
    )[0];
    return { overall: ret, items, reports };
  }
  return { overall: true, items: {}, reports: {} };
}

function computeNode(
  node: EditorNode,
  model: EditorModel,
  page: EditorSubprocess,
  edgeCollection: Record<string, MMELEdge[]>,
  values: EnviromentValues,
  items: Record<string, Record<string, MeasureRType>>,
  pageresult: Record<string, MeasureRType>,
  visited: Record<string, [boolean, boolean]>, // keep computed result to avoid loop
  flatresult: Record<string, MeasureRType>, // for keeping the computed results of processes, due to multiple appearance
  reports: Record<string, MTestReport> // for keeping individual test records for process
): [boolean, boolean] {
  if (visited[node.id] !== undefined) {
    if (isEditorProcess(node) && pageresult[node.id] === undefined) {
      pageresult[node.id] = flatresult[node.id];
    }
    return visited[node.id];
  }
  const edges = edgeCollection[node.id] ?? [];
  if (isEditorEgate(node)) {
    let alldefined = edges.length > 0;
    for (const c of edges) {
      if (c.condition === '') {
        alldefined = false;
      }
    }
    let hasTest = false;
    if (!alldefined) {
      let result = edges.length === 0;
      visited[node.id] = [true, false];
      for (const c of edges) {
        const next = model.elements[c.to];
        if (next !== undefined) {
          const cresult = computeNode(
            next,
            model,
            page,
            edgeCollection,
            values,
            items,
            pageresult,
            visited,
            flatresult,
            reports
          );
          if (cresult[0]) {
            result = true;
          }
          hasTest ||= cresult[1];
        }
      }
      visited[node.id] = [result, hasTest];
      pageresult[node.id] = MeasureRType.NOTEST;
      return [result, hasTest];
    } else {
      // go to exactly one path
      let defaultoption: MMELEdge | null = null;
      if (edges.length > 0) {
        reports[node.id] = [];
      }
      for (const c of edges) {
        if (c.condition === 'default') {
          defaultoption = c;
        } else {
          if (
            evaluateCondition(
              c.condition,
              values,
              reports[node.id],
              `Egde to: ${c.to}`
            )
          ) {
            const next = model.elements[c.to];
            const result = computeNode(
              next,
              model,
              page,
              edgeCollection,
              values,
              items,
              pageresult,
              visited,
              flatresult,
              reports
            );
            visited[node.id] = result;
            pageresult[node.id] = MeasureRType.NOTEST;
            return result;
          }
        }
      }
      // no path is accepted? try default option
      if (defaultoption !== null) {
        const next = model.elements[defaultoption.to];
        const result = computeNode(
          next,
          model,
          page,
          edgeCollection,
          values,
          items,
          pageresult,
          visited,
          flatresult,
          reports
        );
        visited[node.id] = result;
        pageresult[node.id] = MeasureRType.NOTEST;
        return result;
      }
      // no path can be visited? announce dead
      visited[node.id] = [false, false];
      pageresult[node.id] = MeasureRType.ERRORSOURCE;
      return [false, false];
    }
  }
  if (isEditorProcess(node)) {
    let mresult = true;
    if (node.measure.length > 0) {
      reports[node.id] = [];
    }
    node.measure.forEach((m, index) => {
      if (
        !evaluateCondition(m, values, reports[node.id], `Test ${index + 1}`)
      ) {
        mresult = false;
      }
    });
    const hasTest = node.measure.length > 0;
    let childHasTest = false;
    visited[node.id] = [mresult, hasTest];
    let presult = true;
    if (node.page !== '') {
      const nextpage = model.pages[node.page];
      if (nextpage !== undefined) {
        const nextstart = model.elements[nextpage.start];
        if (nextstart !== undefined) {
          items[node.page] = {};
          const [result, cresult] = computeNode(
            nextstart,
            model,
            nextpage,
            buildEdgeConnections(nextpage),
            values,
            items,
            items[node.page],
            visited,
            flatresult,
            reports
          );
          childHasTest = cresult;
          if (!result) {
            presult = false;
          }
        }
      }
    }

    visited[node.id] = [mresult && presult, hasTest || childHasTest];
    if (mresult && presult) {
      pageresult[node.id] =
        hasTest || childHasTest ? MeasureRType.OK : MeasureRType.NOTEST;
    } else {
      pageresult[node.id] = mresult
        ? MeasureRType.CONTAINERROR
        : MeasureRType.ERRORSOURCE;
    }
    flatresult[node.id] = pageresult[node.id];
    if (!visited[node.id][0]) {
      return [false, hasTest];
    }
  } else {
    visited[node.id] = [true, false];
    pageresult[node.id] = MeasureRType.NOTEST;
  }
  const result = visited[node.id];
  for (const c of edges) {
    const child = model.elements[c.to];
    if (child !== undefined) {
      const cresult = computeNode(
        child,
        model,
        page,
        edgeCollection,
        values,
        items,
        pageresult,
        visited,
        flatresult,
        reports
      );
      result[0] &&= cresult[0];
      result[1] ||= cresult[1];
    }
  }
  visited[node.id] = result;
  return result;
}
