import { Logger } from '../../utils/ModelFunctions';
import { EditorModel, isEditorProcess } from '../editormodel';
import { cascadeCheckDCs } from './components/element/dc';
import { cascadeCheckRegs } from './components/element/registry';
import { ElmAction, useElements } from './components/elements';
import { cascadeCheckEnum, EnumAction, useEnums } from './components/enums';
import { MetaAction, useMeta } from './components/meta';
import {
  cascadeCheckPages,
  explorePageDataNodes,
  PageAction,
  usePages,
} from './components/pages';
import { useView, ViewAction } from './components/view';
import { ProvisionAction, useProvisions } from './components/provision';
import { cascadeCheckRefs, RefAction, useRefs } from './components/ref';
import { RoleAction, useRoles, cascadeCheckRole } from './components/roles';
import { SectionAction, useSections } from './components/sections';
import { TermsAction, useTerms } from './components/terms';
import { useVars, VarAction } from './components/vars';
import { cascadeCheckTable, TableAction, useTable } from './components/table';
import { cascadeCheckFigure, FigAction, useFigure } from './components/figure';
import { UndoReducerModelInterface } from './interface';
import {
  cascadeCheckComment,
  CommentAction,
  useComment,
} from './components/comment';
import { useMemo } from 'react';
import { cascadeCheckElm } from './components/element/common';
import { compileHybird, HyEditAction } from './hybird/distributor';
import { NotesAction, useNotes } from './components/notes';
import { MODELVERSION } from '../../utils/constants';
import { LinkAction, useLinks } from './components/links';

type ALLACTION =
  | ElmAction
  | MetaAction
  | SectionAction
  | TermsAction
  | RoleAction
  | RefAction
  | ProvisionAction
  | NotesAction
  | LinkAction
  | PageAction
  | EnumAction
  | VarAction
  | ViewAction
  | TableAction
  | FigAction
  | CommentAction
  | HyEditAction;

type ValidateAction = {
  act: 'validate-page';
  refAction: ModelAction;
  cascade?: ModelAction[];
  page: string;
};

type OwnAction = ValidateAction;

export type ModelAction = (ALLACTION | OwnAction) & { type: 'model' };

export function useModel(x: EditorModel): UndoReducerModelInterface {
  const [meta, actMeta, initMeta] = useMeta(x.meta);
  const [sections, actSections, initSection] = useSections(x.sections);
  const [terms, actTerms, initTerms] = useTerms(x.terms);
  const [roles, actRoles, initRoles] = useRoles(x.roles);
  const [refs, actRefs, initRefs] = useRefs(x.refs);
  const [provisions, actProvision, initProvision] = useProvisions(x.provisions);
  const [notes, actNotes, initNotes] = useNotes(x.notes);
  const [links, actLinks, initLinks] = useLinks(x.links);
  const [pages, actPages, initPages] = usePages(x.pages);
  const [enums, actEnums, initEnums] = useEnums(x.enums);
  const [vars, actVars, initVars] = useVars(x.vars);
  const [views, actViews, initViews] = useView(x.views);
  const [tables, actTables, initTables] = useTable(x.tables);
  const [figures, actFigures, initFigures] = useFigure(x.figures);
  const [comments, actComments, initComments] = useComment(x.comments);
  const [elements, actElements, initElms] = useElements(x.elements);

  const model: EditorModel = useMemo(
    () => ({
      links,
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
      tables,
      figures,
      comments,
      notes,
      version: MODELVERSION,
      root: x.root,
    }),
    [
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
      tables,
      figures,
      comments,
      notes,
      links,
    ]
  );

  // for (const e of Object.values(notes)) {
  //   Logger.log(e.id, [...e.ref]);
  // }
  // Logger.log('Model check');
  // Logger.log(provisions);
  Logger.log('Checking status');
  Logger.log(Object.values(pages).map(p => p.id));
  for (const e of Object.values(elements)) {
    if (isEditorProcess(e)) {
      Logger.log(e.id, e.page, [...e.pages]);
    } else {
      Logger.log(e.id);
    }
  }

  function act(action: ModelAction, page: string): ModelAction | undefined {
    // Logger.log('Action:', action);
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
          const reverseCascade = cascadeCheckRefs(
            elements,
            provisions,
            notes,
            action
          );
          const reverse = actRefs(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'elements': {
          return elementAct(action, page);
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
        case 'table': {
          const reverseCascade = cascadeCheckTable(elements, action);
          const reverse = actTables(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'figure': {
          const reverseCascade = cascadeCheckFigure(elements, action);
          const reverse = actFigures(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'pages': {
          const reverseCascade = cascadeCheckPages(pages, action);
          const reverse = actPages(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'comment': {
          const reverseCascade = cascadeCheckComment(
            elements,
            comments,
            action
          );
          const reverse = actComments(action);
          if (reverse) {
            reverse.cascade = reverseCascade;
          }
          actCascade(action.cascade);
          return convertAction(reverse);
        }
        case 'validate-page': {
          action.cascade = validatePage(action.page, action.refAction).map(
            x => ({ ...x, type: 'model' })
          );
          return action;
        }
        case 'hybird': {
          return hybirdAction(action, page);
        }
        case 'provision': {
          actProvision(action);
          return undefined;
        }
        case 'notes': {
          actNotes(action);
          return undefined;
        }
        case 'link': {
          actLinks(action);
          return undefined;
        }
        default:
          throw new Error(`Action not handled? ${JSON.stringify(action)}`);
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
            case 'notes': {
              actNotes(a);
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
            case 'comment': {
              actComments(a);
              break;
            }
            case 'link': {
              actLinks(a);
              break;
            }
          }
        }
      }
    }
  }

  function elementAct(
    action: ElmAction & { act: 'elements' },
    page: string
  ): ModelAction | undefined {
    switch (action.subtask) {
      case 'registry': {
        const reverseCascade = cascadeCheckRegs(elements, pages, action);
        actCascade(action.cascade);
        const reverse = actElements(action);
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
      case 'flowunit': {
        const reverseCascade = cascadeCheckElm(elements, page, action);
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
    initNotes(x.notes);
    initPages(x.pages);
    initEnums(x.enums);
    initVars(x.vars);
    initViews(x.views);
    initTables(x.tables);
    initFigures(x.figures);
    initComments(x.comments);
    initLinks(x.links);
  }

  /**
   * Called to validate the current page
   * Lazy update mechanism
   * Remove unreachable nodes
   * Add new dependant data if found
   */
  function validatePage(page: string, action: ModelAction): PageAction[] {
    // Logger.log('Doing post processing', action);
    if (action.act === 'elements' || action.act === 'pages') {
      const p = pages[page];
      if (p) {
        const [actions, reverse] = explorePageDataNodes(p, elements);
        // Logger.log('Actions: ', actions);
        actions.forEach(x => actPages(x));
        return reverse;
      }
    }
    return [];
  }

  function hybirdAction(action: HyEditAction, page: string) {
    const reverse = compileHybird(action, model, page);
    if (action.actions) {
      for (const a of action.actions) {
        act(a, page);
      }
    }
    return reverse;
  }

  return [model, act, init];
}

function convertAction(x: ALLACTION | undefined): ModelAction | undefined {
  return x ? { ...x, type: 'model' } : undefined;
}
