import { Logger } from '../../utils/ModelFunctions';
import { EditorModel } from '../editormodel';
import { cascadeCheckRegs } from './components/element/registry';
import { ElmAction, useElements } from './components/elements';
import { MetaAction, useMeta } from './components/meta';
import { PageAction, usePages } from './components/pages';
import { ProvisionAction, useProvisions } from './components/provision';
import { cascadeCheckRefs, RefAction, useRefs } from './components/ref';
import { RoleAction, useRoles, cascadeCheckRole } from './components/roles';
import { SectionAction, useSections } from './components/sections';
import { TermsAction, useTerms } from './components/terms';
import { UndoReducerInterface } from './interface';

type ALLACTION =
  | ElmAction
  | MetaAction
  | SectionAction
  | TermsAction
  | RoleAction
  | RefAction
  | ProvisionAction
  | PageAction;

export type ModelAction = ALLACTION & { type: 'model' };

export function useModel(
  x: EditorModel
): UndoReducerInterface<EditorModel, ModelAction> {
  const [meta, actMeta, initMeta] = useMeta(x.meta);
  const [sections, actSections, initSection] = useSections(x.sections);
  const [terms, actTerms, initTerms] = useTerms(x.terms);
  const [roles, actRoles, initRoles] = useRoles(x.roles);
  const [refs, actRefs, initRefs] = useRefs(x.refs);
  const [provisions, actProvision, initProvision] = useProvisions(x.provisions);
  const [pages, actPages, initPages] = usePages(x.pages);

  const [elements, actElements, initElms] = useElements(x.elements);
  const model: EditorModel = {
    ...x,
    meta,
    sections,
    terms,
    roles,
    elements,
    refs,
    provisions,
    pages,
  };

  function act(action: ModelAction): ModelAction | undefined {
    try {
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
        case 'refs': {
          const reverseCascade = cascadeCheckRefs(elements, provisions, action);
          const reverse = actRefs(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          if (action.cascade) {
            for (const a of action.cascade) {
              if (a.type === 'model') {
                if (a.act === 'elements') {
                  actElements(a);
                } else if (a.act === 'provision') {
                  actProvision(a);
                }
              }
            }
          }
          return reverse ? { ...reverse, type: 'model' } : undefined;
        }
        case 'elements': {
          return elementAct(action);
        }
      }
    } catch (e: unknown) {
      if (typeof e === 'object') {
        const error = e as Error;
        Logger.log(error.message);
        Logger.log(error.stack);
      }
    }
    return undefined;
  }

  function elementAct(
    action: ElmAction & { act: 'elements' }
  ): ModelAction | undefined {
    switch (action.subtask) {
      case 'registry': {
        const reverseCascade = cascadeCheckRegs(elements, pages, action);
        const reverse = actElements(action);
        if (reverse) {
          reverse.cascade = reverseCascade;
        }
        if (action.cascade) {
          for (const a of action.cascade) {
            if (a.type === 'model') {
              if (a.act === 'elements') {
                actElements(a);
              } else if (a.act === 'pages') {
                actPages(a);
              }
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
    initRefs(x.refs);
    initProvision(x.provisions);
    initPages(x.pages);
  }

  return [model, act, init];
}
