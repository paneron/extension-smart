import { Logger } from '../../utils/ModelFunctions';
import { EditorModel } from '../editormodel';
import { cascadeCheckDCs } from './components/element/dc';
import { cascadeCheckRegs } from './components/element/registry';
import {
  ElmAction,
  findActionElement,
  useElements,
} from './components/elements';
import { cascadeCheckEnum, EnumAction, useEnums } from './components/enums';
import { MetaAction, useMeta } from './components/meta';
import { PageAction, usePages } from './components/pages';
import { useView, ViewAction } from './components/view';
import { ProvisionAction, useProvisions } from './components/provision';
import { cascadeCheckRefs, RefAction, useRefs } from './components/ref';
import { RoleAction, useRoles, cascadeCheckRole } from './components/roles';
import { SectionAction, useSections } from './components/sections';
import { TermsAction, useTerms } from './components/terms';
import { useVars, VarAction } from './components/vars';
import { UndoReducerInterface } from './interface';

type ALLACTION =
  | ElmAction
  | MetaAction
  | SectionAction
  | TermsAction
  | RoleAction
  | RefAction
  | ProvisionAction
  | PageAction
  | EnumAction
  | VarAction
  | ViewAction;

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
  const [enums, actEnums, initEnums] = useEnums(x.enums);
  const [vars, actVars, initVars] = useVars(x.vars);
  const [views, actViews, initViews] = useView(x.views);

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
    enums,
    vars,
    views,
  };

  function act(action: ModelAction): ModelAction | undefined {
    try {
      switch (action.act) {
        case 'meta': {
          const reverse = actMeta(action);
          return convertAction(reverse);
        }
        case 'section': {
          const reverse = actSections(action);
          return convertAction(reverse);
        }
        case 'terms': {
          const reverse = actTerms(action);
          return convertAction(reverse);
        }
        case 'roles': {
          const reverseCascade = cascadeCheckRole(elements, action);
          const reverse = actRoles(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'refs': {
          const reverseCascade = cascadeCheckRefs(elements, provisions, action);
          const reverse = actRefs(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'elements': {
          return elementAct(action);
        }
        case 'enums': {
          const reverseCascade = cascadeCheckEnum(elements, action);
          const reverse = actEnums(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'vars': {
          const reverse = actVars(action);
          return convertAction(reverse);
        }
        case 'view': {
          const reverse = actViews(action);
          return convertAction(reverse);
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

  function actCascade(actions: ModelAction[] | undefined) {
    if (actions) {
      for (const a of actions) {
        if (a.type === 'model') {
          switch (a.act) {
            case 'elements': {
              actElements(a);
              break;
            }
            case 'provision': {
              actProvision(a);
              break;
            }
            case 'pages': {
              actPages(a);
              break;
            }
          }
        }
      }
    }
  }

  function elementAct(
    action: ElmAction & { act: 'elements' }
  ): ModelAction | undefined {
    switch (action.subtask) {
      case 'registry': {
        // oldImages are required for handling self-referencing
        const oldImages =
          action.task === 'delete'
            ? action.value.map(x => findActionElement(elements, x))
            : undefined;
        const reverseCascade = cascadeCheckRegs(elements, pages, action);
        actCascade(action.cascade);
        const reverse = actElements(action);
        // reverse actions omitted the cascade updates on self. Replacing the correct images here
        if (oldImages && reverse && reverse.task === 'add') {
          reverse.value = oldImages;
        }
        if (reverse) {
          reverse.cascade = reverseCascade;
        }
        return convertAction(reverse);
      }
      case 'dc': {
        const reverseCascade = cascadeCheckDCs(elements, pages, action);
        actCascade(action.cascade);
        const reverse = actElements(action);
        if (reverse) {
          reverse.cascade = reverseCascade;
        }
        return convertAction(reverse);
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
    initEnums(x.enums);
    initVars(x.vars);
    initViews(x.views);
  }

  return [model, act, init];
}

function convertAction(x: ALLACTION | undefined): ModelAction | undefined {
  return x ? { ...x, type: 'model' } : undefined;
}
