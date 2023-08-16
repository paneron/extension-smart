import { Checkbox } from '@blueprintjs/core';
import React from 'react';
import {
  flowCheckbox,
  flowProgressLabelWithButton,
  flowPercentageLabel,
  flowProgressLabel,
} from '@/css/visual';
import { ChecklistPackage } from '@/smart/model/checklist';
import {
  EditorNode,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
} from '@/smart/model/editormodel';

const CheckListAddon: React.FC<{
  element: EditorNode;
  data: unknown;
}> = function ({ element, data }) {
  const isEGate = isEditorEgate(element);
  const pack = data as ChecklistPackage;
  const id = element.id;
  const { checklist, egatelist, itemsDone } = pack.result;
  const result = checklist[id];
  const egate = egatelist[id];
  const done = itemsDone[id] ?? 0;
  const progress =
    result !== undefined
      ? result.progress
      : egate !== undefined
      ? egate.progress
      : -1;
  const progressDisplay = parseFloat(progress.toFixed(2));

  const { onProgressChange } = pack.callback;
  const isData = isEditorRegistry(element);

  function onChange() {
    if (result.progress === 100) {
      onProgressChange(id, 0);
    } else {
      onProgressChange(id, 100);
    }
  }

  const taskString =
    result !== undefined && result.tasks.length !== 0
      ? `${done} / ${result.tasks.length}`
      : '';

  return (
    <>
      {!isEGate && (
        <div style={flowCheckbox}>
          <Checkbox checked={progress === 100} onChange={onChange} />
        </div>
      )}
      {!isData && !isEGate && (
        <div
          style={
            isEditorProcess(element) && element.page !== ''
              ? flowProgressLabelWithButton
              : flowProgressLabel
          }
        >
          {taskString}
        </div>
      )}
      <div style={flowPercentageLabel}>
        {isData ? taskString : progress !== -1 ? `${progressDisplay}%` : ''}
      </div>
    </>
  );
};

export default CheckListAddon;
