import React from 'react';
import BasicSettingPane from '../control/settings';
import { EditorModel } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';

export enum DiagTypes {
  SETTING = 'setting',
  CONFIRM = 'confirm',
}

export interface IDiagInterface {
  modelwrapper: ModelWrapper;
  setModelWrapper: (mw: ModelWrapper) => void;
  callback?: () => void;
}

export interface EditorDiagProps {
  title: string;
  Panel: React.FC<IDiagInterface>;
  fullscreen: boolean;
}

export const MyDiag: Record<DiagTypes, EditorDiagProps> = {
  [DiagTypes.SETTING]: {
    title: 'Setting',
    fullscreen: true,
    Panel: ({ modelwrapper, setModelWrapper }) => (
      <BasicSettingPane
        model={modelwrapper.model}
        setModel={(model: EditorModel) =>
          setModelWrapper({ ...modelwrapper, model: model })
        }
      />
    ),
  },
  [DiagTypes.CONFIRM]: {
    title: 'Confirmation',
    fullscreen: true,
    Panel: () => (
      <></>        
    ),
  }
};
