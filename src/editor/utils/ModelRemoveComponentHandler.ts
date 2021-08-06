import { EditorModel } from "../model/editormodel";

export function deleteEdge(model: EditorModel, pageid: string, edgeid: string):EditorModel {
  const page = model.pages[pageid];    
  delete page.edges[edgeid];
  return model;
}