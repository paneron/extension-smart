import { EditorModel } from "../editormodel";
import { MetaAction, useMeta } from "./components/meta";
import { UndoReducerInterface } from "./interface";

export type ModelAction = MetaAction & {type: 'model'};

export function useModel(x: EditorModel):UndoReducerInterface<EditorModel, ModelAction> {
  const [meta, actMeta, initMeta] = useMeta(x.meta);      
  const model:EditorModel = {...x, meta};

  function act(action: ModelAction): ModelAction | undefined {
    switch (action.act) {
      case 'meta': 
        const reverse = actMeta(action);
        if (reverse) {
          return {...reverse, type:'model'}
        } else {
          return undefined;
        }      
    }    
  }

  function init(x: EditorModel) {
    initMeta(x.meta);
  }

  return [model, act, init];
}