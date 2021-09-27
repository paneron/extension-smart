// export function getSimulationView(
//   result: string,
//   CustomAttribute: React.FC<{
//     att: MMELDataAttribute;
//     getRefById?: (id: string) => MMELReference | null;
//     data: unknown;
//     dcid: string;
//   }>,
//   CustomProvision: React.FC<{
//     provision: MMELProvision;
//     getRefById?: (id: string) => MMELReference | null;
//     data: unknown;
//   }>,
//   getEdgeColor: (id: string, pageid: string, data: unknown) => string,
//   isEdgeAnimated: (id: string, pageid: string, data: unknown) => boolean
// ): ViewFunctionInterface {
//   return {
//     getStyleById,
//     getSVGColorById,
//     data: result,
//     NodeAddon: CheckListAddon,
//     CustomAttribute,
//     CustomProvision,
//     getEdgeColor,
//     isEdgeAnimated,
//   };
// }

// function getStyleById(id: string, _: string, data: unknown) {
//   const pack = data as ChecklistPackage;
//   const result = pack.result;
//   const item = result.checklist[id];
//   if (item !== undefined) {
//     return flow_node__highlighed(item.progress === 100 ? okcolor : normalcolor);
//   }
//   return flow_node__highlighed(normalcolor);
// }

// function getSVGColorById(id: string, _: string, data: unknown): string {
//   const pack = data as ChecklistPackage;
//   const result = pack.result;
//   const item = result.checklist[id];
//   if (item !== undefined) {
//     return item.progress === 100 ? okcolor : 'none';
//   }
//   const egate = result.egatelist[id];
//   if (egate !== undefined) {
//     return egate.progress === 100 ? okcolor : 'none';
//   }
//   return 'none';
// }
