import { EditorModel } from '../editormodel';
import { ElmAction, useElements } from './components/elements';
import { MetaAction, useMeta } from './components/meta';
import { RoleAction, useRoles, cascadeCheckRole } from './components/roles';
import { SectionAction, useSections } from './components/sections';
import { TermsAction, useTerms } from './components/terms';
import { UndoReducerInterface } from './interface';

type ALLACTION =
  | ElmAction
  | MetaAction
  | SectionAction
  | TermsAction
  | RoleAction;

export type ModelAction = ALLACTION & { type: 'model' };

export function useModel(
  x: EditorModel
): UndoReducerInterface<EditorModel, ModelAction> {
  const [meta, actMeta, initMeta] = useMeta(x.meta);
  const [sections, actSections, initSection] = useSections(x.sections);
  const [terms, actTerms, initTerms] = useTerms(x.terms);
  const [roles, actRoles, initRoles] = useRoles(x.roles);

  const [elements, actElements, initElms] = useElements(x.elements);
  const model: EditorModel = { ...x, meta, sections, terms, roles, elements };

  function act(action: ModelAction): ModelAction | undefined {
    switch (action.act) {
      case 'meta': {
        const reverse = actMeta(action);
        return reverse ? { ...reverse, type: 'model' } : undefined;
      }
      case 'section': {
        const reverse = actSections(action);
        return reverse ? { ...reverse, type: 'model' } : undefined;
      }
      case 'terms': {
        const reverse = actTerms(action);
        return reverse ? { ...reverse, type: 'model' } : undefined;
      }
      case 'roles': {
        const reverseCascade = cascadeCheckRole(elements, action);
        const reverse = actRoles(action);
        if (reverse) {
          reverse.cascade = reverseCascade;
        }
        if (action.cascade) {
          for (const a of action.cascade) {            
            if (a.type === 'model' && a.act === 'elements') {
              actElements(a);              
            }
          }
        }        
        return reverse ? { ...reverse, type: 'model' } : undefined;
      }
    }
    return undefined;
  }

  function init(x: EditorModel) {
    initMeta(x.meta);
    initSection(x.sections);
    initTerms(x.terms);
    initRoles(x.roles);
    initElms(x.elements);
  }

  return [model, act, init];
}
