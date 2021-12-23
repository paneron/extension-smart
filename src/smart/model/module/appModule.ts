import { IconName } from '@blueprintjs/core';
import React from 'react';
import DocumentViewer from '../../ui/docviewer';
import EditWrapper from '../../ui/editFunctions/EditWrapper';
import LinkAnalysis from '../../ui/LinkAnalysis';
import DocumentEdit from '../../ui/maindocedit';
import ModelMapper from '../../ui/mainmapper';
import ModelViewer from '../../ui/mainviewer';
import ModelWorkspace from '../../ui/modelWorkspace';
import NLPMain from '../../ui/nlp/NLPMain';
import RepoViewer from '../../ui/repo/RepoViewer';
import { EditorModel } from '../editormodel';
import { RepoHistory } from '../history';
import { MapProfile } from '../mapmodel';
import { MMELRepo, RepoIndex, RepoItemType } from '../repo';
import { SMARTWorkspace } from '../workspace';

export type ModelModuleConfig = BaseConfig & {
  type: 'model';
  view: React.FC<
    BaseViewProps & {
      repo: MMELRepo;
      setRepo: (x?: MMELRepo) => void;
      index: RepoIndex;
      linktoAnotherRepo: (x: MMELRepo) => void;
      repoHis: RepoHistory;
      setRepoHis: (x: RepoHistory) => void;
      setClickListener: (f: (() => void)[]) => void;
      model: EditorModel;
      mapping: MapProfile;
      ws: SMARTWorkspace;
    }
  >;
};

export type DocModuleConfig = BaseConfig & {
  type: 'doc';
  view: React.FC<
    BaseViewProps & {
      repo: MMELRepo;
    }
  >;
};

export type NeutralModuleConfig = BaseConfig & {
  type: 'neutral';
  view: React.FC<
    BaseViewProps & {
      setRepo: (x?: MMELRepo) => void;
      index: RepoIndex;
    }
  >;
};

type BaseViewProps = {
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
};

type BaseConfig = {
  title: string;
  description: string;
  icon: IconName;
};
export type ModuleType = ModuleConfiguration['type'];
export type ModuleConfiguration =
  | ModelModuleConfig
  | DocModuleConfig
  | NeutralModuleConfig;

const MODULES = [
  'repo',
  'modelViewer',
  'modelEditor',
  'modelMapper',
  'modelImplement',
  'docViewer',
  'linkAnalysis',
  'nlp',
  'docEdit',
] as const;

export type ModuleName = typeof MODULES[number];

export const ModuleList: Record<RepoItemType | '', ModuleName[]> = {
  '': ['repo', 'docEdit'],
  Doc: ['repo', 'docViewer'],
  Ref: [
    'repo',
    'modelViewer',
    'modelMapper',
    'modelImplement',
    'linkAnalysis',
    'nlp',
  ],
  Imp: [
    'repo',
    'modelViewer',
    'modelEditor',
    'modelMapper',
    'modelImplement',
    'linkAnalysis',
    'nlp',
  ],
};

export const MODULE_CONFIGURATION: Record<ModuleName, ModuleConfiguration> = {
  repo: {
    title: 'Repository',
    description: 'Model repository',
    icon: 'projects',
    type: 'neutral',
    view: RepoViewer,
  },
  modelViewer: {
    title: 'View',
    description: 'Model viewer',
    icon: 'eye-open',
    type: 'model',
    view: ModelViewer,
  },
  modelEditor: {
    title: 'Edit',
    description: 'Model editor',
    icon: 'edit',
    type: 'model',
    view: EditWrapper,
  },
  modelMapper: {
    title: 'Map',
    description: 'Model mapper',
    icon: 'data-lineage',
    type: 'model',
    view: ModelMapper,
  },
  modelImplement: {
    title: 'Implementation',
    description: 'Model implementation',
    icon: 'unarchive',
    type: 'model',
    view: ModelWorkspace,
  },
  docViewer: {
    title: 'Document viewer',
    description: 'Document viewer',
    icon: 'document-open',
    type: 'doc',
    view: DocumentViewer,
  },
  linkAnalysis: {
    title: 'Link Analyser',
    description: 'Analyse links between models',
    icon: 'predictive-analysis',
    type: 'model',
    view: LinkAnalysis,
  },
  nlp: {
    title: 'Knowledge graph',
    description: 'Knowledge graph',
    icon: 'chat',
    type: 'model',
    view: NLPMain,
  },
  docEdit: {
    title: 'Create SMART Document',
    description: 'Document import',
    icon: 'document',
    type: 'neutral',
    view: DocumentEdit,
  },
};
