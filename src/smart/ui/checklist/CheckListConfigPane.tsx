import { Button, Checkbox, Text } from '@blueprintjs/core';
import React from 'react';
import { useEffect, useState } from 'react';
import MGDLabel from '@/smart/MGDComponents/MGDLabel';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import type {
  ChecklistCallback,
  ChecklistPackage,
  ChecklistResult,
  ChecklistSetting,
} from '@/smart/model/checklist';
import type { EditorModel } from '@/smart/model/editormodel';
import type { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import { updateResult } from '@/smart/utils/checklist/ChecklistCalculator';
import {
  calEdgeAnimated,
  calEdgeColor,
  getCheckListView,
} from '@/smart/utils/checklist/ChecklistViewer';
import {
  calculateTaskList,
  initResult,
} from '@/smart/utils/checklist/CheckllistInitializer';
import type { ModalityType } from '@/smart/utils/constants';
import { MODAILITYOPTIONS } from '@/smart/utils/constants';
import CircleGraph from '@/smart/ui/dashboard/CircleGraph';
import { CustomCLAttribute, CustomCLProvision } from '@/smart/ui/checklist/CustomFields';

const ModalityText: Record<ModalityType, string> = {
  ''       : 'Not specified (empty)',
  'CAN'    : 'CAN',
  'MAY'    : 'MAY',
  'MUST'   : 'MUST',
  'SHALL'  : 'SHALL',
  'SHOULD' : 'SHOULD',
};

const ChecklistConfigPane: React.FC<{
  model: EditorModel;
  setView: (view: ViewFunctionInterface | undefined) => void;
}> = function ({ model, setView }) {
  const [modality, setChecklistSetting] = useState<ChecklistSetting>({
    ''       : false,
    'CAN'    : false,
    'MAY'    : false,
    'MUST'   : true,
    'SHALL'  : true,
    'SHOULD' : false,
  });

  const [result, setResult] = useState<ChecklistResult | undefined>(undefined);

  function action() {
    if (result !== undefined) {
      clean();
    } else {
      const [task, egates, inverted] = calculateTaskList(model, modality);
      const result = initResult(task, egates, inverted, model);
      const callback: ChecklistCallback = {
        onProgressChange,
      };
      setResult(result);
      const view = getCheckListView(
        { result, callback },
        CustomCLAttribute,
        CustomCLProvision,
        getEdgeColor,
        isEdgeAnimated
      );
      setView(view);
    }
  }

  function onProgressChange(id: string, progress: number) {
    setResult(old => {
      if (old !== undefined) {
        const result = updateResult(old, id, progress, model);
        const callback: ChecklistCallback = {
          onProgressChange,
        };
        const view = getCheckListView(
          { result, callback },
          CustomCLAttribute,
          CustomCLProvision,
          getEdgeColor,
          isEdgeAnimated
        );
        setView(view);
        return result;
      }
      return old;
    });
  }

  function isEdgeAnimated(id: string, pageid: string, data: unknown): boolean {
    return calEdgeAnimated(id, pageid, data as ChecklistPackage, model);
  }

  function getEdgeColor(id: string, pageid: string, data: unknown): string {
    return calEdgeColor(id, pageid, data as ChecklistPackage, model);
  }

  function flip(opt: ModalityType) {
    if (result === undefined) {
      setChecklistSetting({ ...modality, [opt] : !modality[opt] });
    }
  }

  function clean() {
    setResult(undefined);
    setView(undefined);
  }

  useEffect(() => clean, [model]);

  return (
    <MGDSidebar>
      {result !== undefined && (
        <div
          style={{
            display       : 'flex',
            flexDirection : 'column',
            alignItems    : 'center',
          }}
        >
          <MGDLabel>Overall Progress</MGDLabel>
          <div style={{ width : '50%' }}>
            <CircleGraph percentage={result.checklist['#root'].progress} />
          </div>
        </div>
      )}
      <fieldset>
        <legend>Checklist settings</legend>
        <Text> Include the following modality: </Text>
        {MODAILITYOPTIONS.map(opt => (
          <Checkbox
            key={`Option${opt}`}
            checked={modality[opt]}
            label={ModalityText[opt]}
            onChange={() => flip(opt)}
          />
        ))}
      </fieldset>
      <Button onClick={action}>
        {result !== undefined ? 'Reset' : 'Start self-assessment'}
      </Button>
    </MGDSidebar>
  );
};

export default ChecklistConfigPane;
