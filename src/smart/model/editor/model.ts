import * as Logger from '@/lib/logger';
import type { EditorModel } from '@/smart/model/editormodel';
import { cascadeCheckDCs } from '@/smart/model/editor/components/element/dc';
import { cascadeCheckRegs } from '@/smart/model/editor/components/element/registry';
import type { ElmAction } from '@/smart/model/editor/components/elements';
import { useElements } from '@/smart/model/editor/components/elements';
import type { EnumAction } from '@/smart/model/editor/components/enums';
import { cascadeCheckEnum, useEnums } from '@/smart/model/editor/components/enums';
import type { MetaAction } from '@/smart/model/editor/components/meta';
import { useMeta } from '@/smart/model/editor/components/meta';
import type {
  PageAction } from '@/smart/model/editor/components/pages';
import {
  cascadeCheckPages,
  explorePageDataNodes,
  usePages,
} from '@/smart/model/editor/components/pages';
import type { ViewAction } from '@/smart/model/editor/components/view';
import { useView } from '@/smart/model/editor/components/view';
import type { ProvisionAction } from '@/smart/model/editor/components/provision';
import { useProvisions } from '@/smart/model/editor/components/provision';
import type { RefAction } from '@/smart/model/editor/components/ref';
import { cascadeCheckRefs, useRefs } from '@/smart/model/editor/components/ref';
import type { RoleAction } from '@/smart/model/editor/components/roles';
import { useRoles, cascadeCheckRole } from '@/smart/model/editor/components/roles';
import type { SectionAction } from '@/smart/model/editor/components/sections';
import { useSections } from '@/smart/model/editor/components/sections';
import type { TermsAction } from '@/smart/model/editor/components/terms';
import { useTerms } from '@/smart/model/editor/components/terms';
import type { VarAction } from '@/smart/model/editor/components/vars';
import { useVars } from '@/smart/model/editor/components/vars';
import type { TableAction } from '@/smart/model/editor/components/table';
import { cascadeCheckTable, useTable } from '@/smart/model/editor/components/table';
import type { FigAction } from '@/smart/model/editor/components/figure';
import { cascadeCheckFigure, useFigure } from '@/smart/model/editor/components/figure';
import type { UndoReducerModelInterface } from '@/smart/model/editor/interface';
import type {
  CommentAction } from '@/smart/model/editor/components/comment';
import {
  cascadeCheckComment,
  useComment,
} from '@/smart/model/editor/components/comment';
import { useMemo } from 'react';
import { cascadeCheckElm } from '@/smart/model/editor/components/element/common';
import type { HyEditAction } from '@/smart/model/editor/hybird/distributor';
import { compileHybird } from '@/smart/model/editor/hybird/distributor';
import type { NotesAction } from '@/smart/model/editor/components/notes';
import { useNotes } from '@/smart/model/editor/components/notes';
import { MODELVERSION } from '@/smart/utils/constants';
import type { LinkAction } from '@/smart/model/editor/components/links';
import { useLinks } from '@/smart/model/editor/components/links';

interface InitModelAction {
  act: 'initModel';
  value: EditorModel;
}

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
  | HyEditAction
  | InitModelAction;

interface ValidateAction {
  act: 'validate-page';
  refAction: ModelAction;
  cascade?: ModelAction[];
  page: string;
}

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
      version : MODELVERSION,
      root    : x.root,
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
  // Logger.log('Checking status');
  // Logger.log(Object.values(pages).map(p => p.id));
  // for (const e of Object.values(elements)) {
  //   if (isEditorProcess(e)) {
  //     Logger.log(e.id, e.page, [...e.pages]);
  //   } else {
  //     Logger.log(e.id);
  //   }
  // }

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
          action.cascade = validatePage(action.page).map(x => ({
            ...x,
            type : 'model',
          }));
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
        case 'initModel': {
          init(action.value);
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
        const reverseCascade = cascadeCheckElm(page, action);
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
  function validatePage(page: string): PageAction[] {
    const p = pages[page];
    if (p) {
      const [actions, reverse] = explorePageDataNodes(p, elements);
      actions.forEach(x => actPages(x));
      return reverse;
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
  return x ? { ...x, type : 'model' } : undefined;
}
