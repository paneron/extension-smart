import { flow_node__highlighed, no_highlight } from '@/css/visual';
import { MeasureResult } from '@/smart/model/Measurement';
import { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import { MeasureResultStyles } from '@/smart/utils/measurement/Checker';
import MeasurementTooltip from '@/smart/ui/measurement/MeasurementTooltip';

export default function updateMeasurementView(
  result: MeasureResult,
  setView: (view: ViewFunctionInterface) => void
) {
  setView({
    getStyleById,
    getSVGColorById,
    legendList       : MeasureResultStyles,
    data             : result,
    ComponentToolTip : MeasurementTooltip,
  });
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
