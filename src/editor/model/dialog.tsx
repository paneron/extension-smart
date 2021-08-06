import React from 'react';
import BasicSettingPane from '../ui/control/settings';
import { EditorModel } from './editormodel';
import { ModelWrapper } from './modelwrapper';

export enum DiagTypes {
  SETTING = 'setting',
}

export interface IDiagInterface {
  modelwrapper: ModelWrapper;
  setModelWrapper: (mw: ModelWrapper) => void;
}

export interface EditorDiagProps {
  title: string;
  Panel: React.FC<IDiagInterface>;
}

export const MyDiag: Record<DiagTypes, EditorDiagProps> = {
  [DiagTypes.SETTING]: {
    title: 'Setting',
    Panel: ({ modelwrapper, setModelWrapper }) => (
      <BasicSettingPane
        model={modelwrapper.model}
        setModel={(model: EditorModel) =>
          setModelWrapper({ ...modelwrapper, model: model })
        }
      />
    ),
  },
};
