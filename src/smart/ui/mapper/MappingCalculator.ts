import { CSSProperties } from "react";
import { EditorModel, EditorSubprocess, isEditorAppproval, isEditorEgate, isEditorProcess } from "../../model/editormodel";
import { MappingType, MapSet } from "./mapmodel";

export enum MapCoverType {
  FULL = 'full',
  PASS = 'pass',
  PARTIAL = 'partial',
  NONE = 'none'
}

export interface MapResultInterface {
  label: string;
  color: string;
}

export const MappingResultStyles: Record<MapCoverType, MapResultInterface> = {
  [MapCoverType.FULL]: { label:'Fully covered', color:'lightgreen' },
  [MapCoverType.PASS]: { label:'Minimal covered', color:'lightblue' },
  [MapCoverType.PARTIAL]: { label:'Partially covered', color:'lightyellow' },
  [MapCoverType.NONE]: { label:'Not covered', color:'#E9967A' }
};

// MapResultType[nodeid] = MapCoverType
export type MapResultType = Record<string, MapCoverType>;

export function calculateMapping(model:EditorModel, mapping:MappingType): MapResultType {
  const mr:MapResultType = {};  
  Object.values(mapping).forEach(
    m => Object.keys(m).forEach(
      k => mr[k] = MapCoverType.FULL
    )
  );
  explorePage(model.pages[model.root], mr, model);      
  return mr;
}

function check(id:string, mr: MapResultType, model:EditorModel):MapCoverType {
  const node = model.elements[id];
  if (isEditorProcess(node)) {
    if (node.page !== '') {
      mr[id] = MapCoverType.FULL; // set an initial value to avoid infinite loop, if the subprocess contains itself, it counts ok now
      return explorePage(model.pages[node.page], mr, model);
    } else {
      return MapCoverType.NONE;
    }
  } else if (isEditorAppproval(node)) {
    return MapCoverType.NONE;
  } else {
    return MapCoverType.FULL;
  }  
}

function traverse(id:string, page:EditorSubprocess, mr:MapResultType, model:EditorModel, visited:Record<string, boolean>):boolean {  
  const node = model.elements[id];
  const result = mr[id];
  if (result !== MapCoverType.FULL && result !== MapCoverType.PASS) {
    visited[id] = false;
    return false;
  }
  if (isEditorEgate(node)) {
    let result = false;
    for (const elm of page.neighbor![id]) {
      if (visited[elm] === undefined) {
        visited[elm] = traverse(elm, page, mr, model, visited);
      }
      result ||= visited[elm];
    }
    return result;
  } else {
    let result = true;
    if (page.neighbor[id] === undefined) {
      return result;
    } else {
      for (const elm of page.neighbor![id]) {
        if (visited[elm] === undefined) {
          visited[elm] = traverse(elm, page, mr, model, visited);
        }
        result &&= visited[elm];
      }  
      return result;
    }
  }  
}

function explorePage (
  page:EditorSubprocess, 
  mr: MapResultType, 
  model: EditorModel
) : MapCoverType {
  let somethingCovered = false;
  let somethingNotCovered = false;

  // first, check every node individually
  for (const c in page.childs) {
    const id = page.childs[c].element;    
    const node = model.elements[id];
    if (mr[id] === undefined) {      
      mr[id] = check(id, mr, model);
    } 
    if (isEditorProcess(node) || isEditorAppproval(node)) {
      if (mr[id] !== MapCoverType.NONE) {
        somethingCovered = true;
      }
      if (mr[id] !== MapCoverType.FULL) {
        somethingNotCovered = true;
      }
    } 
  }

  if (!somethingNotCovered) {
    return MapCoverType.FULL;
  }

  // traverse the path from start to see if all necessary items are covered
  if (traverse(page.start, page, mr, model, {})) {
    return MapCoverType.PASS;
  }
  return somethingCovered ? MapCoverType.PARTIAL : MapCoverType.NONE;
}

export function getMapStyleById(mapResult:MapResultType, id:string):CSSProperties {
  const result = mapResult[id];  
  if (result === undefined) {
     return {
      backgroundColor: MappingResultStyles[MapCoverType.NONE].color
    };
  }  
  return {
    backgroundColor: MappingResultStyles[result].color
  };  
}

export function getSourceStyleById(mapSet:MapSet, id:string):CSSProperties {
  if (mapSet.mappings[id] === undefined || Object.keys(mapSet.mappings[id]).length === 0) {
     return {};
  }  
  return {
    backgroundColor: 'lightgreen'
  };
}