import { flow_node__highlighed } from '@/css/visual';
import { MeasureResult } from '@/smart/model/Measurement';
import { LegendInterface } from '@/smart/model/States';
import { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';

export default function updateParaView(
  result: MeasureResult,
  setView: (view: ViewFunctionInterface) => void
) {
  setView({
    getStyleById,
    getSVGColorById : () => 'none',
    legendList      : ViewStyles,
    data            : result,
  });
}

const ViewStyles: Record<string, LegendInterface> = {
  present : { label : 'Required', color : 'lightgreen' },
  abs     : { label : 'Not required', color : 'lightgray' },
};

function getStyleById(id: string, pageid: string, data: unknown) {
  const result = data as MeasureResult;
  const pageresult = result.items[pageid] ?? {};
  const componentresult = pageresult[id];
  if (componentresult === undefined) {
    return flow_node__highlighed(ViewStyles.abs.color);
  }
  return flow_node__highlighed(ViewStyles.present.color);
}