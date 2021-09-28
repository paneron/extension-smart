/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, Text } from '@blueprintjs/core';
import { Classes, Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { jsx } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { CSSProperties, useContext, useState } from 'react';
import { popover_panel_container } from '../../../css/layout';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import MGDHeading from '../../MGDComponents/MGDHeading';
import { EditorModel, EditorProcess, isEditorProcess } from '../../model/editormodel';
import { ModelWrapper } from '../../model/modelwrapper';
import { createSubprocessComponent } from '../../utils/EditorFactory';
import { handleModelOpen } from '../../utils/IOFunctions';
import { getNamespace } from '../../utils/ModelFunctions';
import { addProcessIfNotFound } from '../../utils/ModelImport';

const centeredLayout: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const rightAlignedLayout: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const ImportModelDiag: React.FC<{
  modelwrapper: ModelWrapper;
  setModel: (m: EditorModel) => void;  
  closeDialog: () => void;
}> = function ({ modelwrapper, setModel, closeDialog }) {  
  const { useDecodedBlob, requestFileFromFilesystem, logger } =
    useContext(DatasetContext);

  const [mw, setMW] = useState<ModelWrapper | undefined>(undefined);  
  const [selected, setSelected] = useState<string|undefined>(undefined);  

  async function handleOpenModel() {
    handleModelOpen({
      setModelWrapper: setMW,
      useDecodedBlob,
      requestFileFromFilesystem,
      logger,
    });
  }

  function importModel() {
    if (mw !== undefined && selected !== undefined) {
      const model = modelwrapper.model;
      const process = addProcessIfNotFound(modelwrapper, mw, selected, {}, {}, {});
      const nc = createSubprocessComponent(process.id);
      nc.x = 0;
      nc.y = 0;
      const page = model.pages[modelwrapper.page];
      page.childs[process.id] = nc;
      process.pages.add(mw.page);
      setModel({...model});
      closeDialog();
    }
  }

  return (
    <MGDDisplayPane>
      <MGDHeading>        
        Import component from external model 
      </MGDHeading>
      <fieldset>
        <legend>Source model</legend>
        <div style={centeredLayout}>
          <Text>Model file:</Text>
          <Button
            intent={mw !== undefined ? 'success' : 'danger'}
            onClick={handleOpenModel}
          >
            {mw !== undefined ? 'Model set' : 'Model not set'}
          </Button>
          {mw !== undefined && <Text>Namespace: {getNamespace(mw.model)}</Text>}
        </div>
        <div style={centeredLayout}>
          <Text>Selected component:</Text>
          <Popover2 disabled={mw===undefined} content={mw !== undefined ? <CandidateList model={mw.model} setSelected={setSelected} /> : <></>} position='bottom'>
            <Button intent={selected !== undefined ? 'success' : 'danger'}>
              {selected??'No component is selected'}
            </Button>
          </Popover2>
        </div>
        <div style={rightAlignedLayout}>
          <Button large disabled={selected === undefined} onClick={() => importModel()}>
            Import to model
          </Button>
        </div>
      </fieldset>
    </MGDDisplayPane>
  );
};

const CandidateList: React.FC<{
  model: EditorModel;
  setSelected: (id:string) => void;
}> = function ({model, setSelected}) {
  const processes = Object.values(model.elements).filter(x => isEditorProcess(x)).map(x => x as EditorProcess);
  return (
    <div css={popover_panel_container}>
      {processes.map(p => 
        <Tooltip2 targetTagName='div' content={p.name}>
          <Button className={Classes.POPOVER2_DISMISS} onClick={() => setSelected(p.id)} fill>
            {p.id}
          </Button>
        </Tooltip2>
      )}
    </div>
  );
}

export default ImportModelDiag;
