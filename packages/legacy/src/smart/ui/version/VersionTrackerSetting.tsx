import { Button, Switch, Text } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useEffect, useRef, useState } from 'react';
import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import { PageHistory } from '@/smart/model/history';
import { ModelWrapper } from '@/smart/model/modelwrapper';
import { FunModel } from '@/smart/model/States';
import { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import { handleModelOpen } from '@/smart/utils/IOFunctions';
import { buildModelLinks } from '@/smart/utils/ModelFunctions';
import * as Logger from '@/lib/logger';
import {
  computeDiff,
  getDiffViewProps,
  getHistroyFromRefModel,
} from '../../utils/VersionTracker';
import { DescriptionItem } from '@/smart/ui/common/description/fields';

const VersionTrackerSettingPane: React.FC<{
  mw: ModelWrapper;
  history: PageHistory;
  setView: (view: ViewFunctionInterface | undefined) => void;
  setFunctionalState: (props: FunModel | undefined) => void;
}> = function ({ mw, history, setView, setFunctionalState }) {
  const { requestFileFromFilesystem, logger } = useContext(DatasetContext);

  const [change, setChange] = useState<ModelWrapper | undefined>(undefined);
  const [viewCompare, setViewCompare] = useState<boolean>(false);
  const viewModel = useRef<boolean>(false);
  viewModel.current = viewCompare;

  const model = mw.model;
  const meta = model.meta;

  function setModelWrapper(m: ModelWrapper) {
    const newmeta = m.model.meta;
    if (newmeta.namespace !== meta.namespace) {
      Logger.error('Namespaces of the model for comparison do not match.');
    } else if (newmeta.edition === meta.edition) {
      Logger.error(
        'Edition of the model for comparison is the same as the base model.'
      );
    } else {
      if (viewCompare) {
        setViewCompare(false);
        const updated = getHistroyFromRefModel(mw, history);
        setFunctionalState({ mw, history : updated });
      } else {
        setFunctionalState({ mw, history });
      }
      const result = computeDiff(mw, m, viewModel);
      setView(getDiffViewProps(result));
      setChange(m);
    }
  }

  function setVersion() {
    handleModelOpen({
      setModelWrapper,
      requestFileFromFilesystem,
      logger,
      indexModel : buildModelLinks,
    });
  }

  function onViewChange() {
    if (change !== undefined) {
      const view = !viewCompare;
      const modelWrapper = view ? change : mw;
      const updatedHis = view
        ? getHistroyFromRefModel(change, history)
        : getHistroyFromRefModel(mw, history);
      setFunctionalState({ mw : modelWrapper, history : updatedHis });
      setViewCompare(view);
    }
  }

  function reset() {
    setViewCompare(false);
    setChange(undefined);
    setView(undefined);
    setFunctionalState(undefined);
  }

  useEffect(() => reset, [model]);

  return meta.namespace !== '' ? (
    <MGDSidebar>
      <fieldset>
        <legend>Base model</legend>
        <DescriptionItem label="Namespace" value={meta.namespace} />
        <DescriptionItem label="Edition" value={meta.edition} />
      </fieldset>
      <fieldset>
        <legend>Edition for comparison</legend>
        <DescriptionItem
          label="Edition"
          value={change ? change.model.meta.edition : 'Not set'}
        />
        <Button onClick={setVersion}>Set model</Button>
      </fieldset>
      {change !== undefined && (
        <Switch
          label="View"
          alignIndicator="right"
          innerLabel="Base"
          innerLabelChecked="Compared"
          checked={viewCompare}
          onChange={onViewChange}
          inline
        />
      )}
    </MGDSidebar>
  ) : (
    <MGDSidebar>
      <Text>Namespace of the model is empty.</Text>
    </MGDSidebar>
  );
};

export default VersionTrackerSettingPane;
