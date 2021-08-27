/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { RefObject, useContext, useMemo, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import {
  EditorApproval,
  EditorModel,
  EditorProcess,
  EditorSubprocess,
  getEditorNodeById,
  ModelType,
} from '../model/editormodel';
import {
  createMapProfile,
  createNewMapSet,
  getMappings,
  MappingMeta,
  MapProfile,
  MapSet,
} from '../model/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import {
  ControlGroup,
  Dialog,  
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MapperFileMenu from './menu/mapperfile';
import { createPageHistory, PageHistory } from '../model/history';
import {
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
} from '../model/state';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper } from '../model/modelwrapper';
import {
  calculateMapping,  
  filterMappings,  
  MapResultType,  
} from '../utils/MappingCalculator';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { Logger } from '../utils/ModelFunctions';
import MappingCanvus from './mapper/mappingCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { EditMPropsInterface } from './dialog/dialogs';
import MappingEditPage from './edit/mappingedit';
import DocTemplatePane from './reporttemplate/doctemplatepane';
import MGDButton from '../MGDComponents/MGDButton';
import { dialog_layout, mappper_container } from '../../css/layout';
import { vertical_line } from '../../css/components';
import { findPageContainingElement } from '../utils/SearchFunctions';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const lineref: RefObject<HTMLDivElement> = React.createRef();

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger } = useContext(DatasetContext);

  Logger.logger = logger!;

  const [mapProfile, setMapProfile] = useState<MapProfile>(createMapProfile());
  const [viewOption, setViewOption] = useState<MapperViewOption>({
    dataVisible: true,
    legVisible: true,
    docVisible: false,
  });
  const [implementProps, setImplProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.IMP,
    historyMap: {}
  });
  const [referenceProps, setRefProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.REF,
    historyMap: {}
  });
  const [selected, setSelected] = useState<MapperSelectedInterface>({
    modelType: ModelType.IMP,
    selected: '',
  });
  const [mapResult, setMapResult] = useState<MapResultType>({});  

  const [editMappingProps, setEditMProps] = useState<EditMPropsInterface>({
    from: '',
    to: '',
  });

  const refmodel = referenceProps.modelWrapper.model;
  const impmodel = implementProps.modelWrapper.model;
  const refns =
    refmodel.meta.namespace === '' ? 'defaultns' : refmodel.meta.namespace;
  if (mapProfile.mapSet[refns] === undefined) {
    mapProfile.mapSet[refns] = createNewMapSet(refns);
  }
  const mapSet = mapProfile.mapSet[refns];
  const impPage = impmodel.pages[implementProps.modelWrapper.page];
  const refPage = refmodel.pages[referenceProps.modelWrapper.page];

  const mapEdges = useMemo (() => filterMappings(
    mapSet,
    impPage,
    refPage,
    selected,
    impmodel.elements,
    refmodel.elements
  ), [mapSet, impPage, refPage, selected]);  

  function updateMapStyle({ model = refmodel, mp = mapProfile }) {
    setMapResult(calculateMapping(model, getMappings(mp, refns)));
  }

  function onMapSetChanged(ms: MapSet) {
    const newProfile: MapProfile = {
      ...mapProfile,
      mapSet: { ...mapProfile.mapSet, [ms.id]: ms },
    };
    setMapProfile(newProfile);
    updateMapStyle({ mp: newProfile });    
  }

  function onRefModelChanged(model: EditorModel) {
    referenceProps.modelWrapper.model = model;
    updateMapStyle({ model: model });
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
    updateMapStyle({ mp: mp });    
  }

  function onImpModelChanged(model: EditorModel) {
    onMapProfileChanged({ id: model.meta.namespace, mapSet: {}, docs: {} });
    implementProps.modelWrapper.model = model;
  }  

  function onImpPropsChange(state: MapperState) {
    setImplProps(state);
  }

  function onRefPropsChange(state: MapperState) {
    setRefProps(state);
  }

  function onMappingEdit(from: string, to: string) {
    setEditMProps({ from, to });
  }

  function onMappingChange(update: MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[
        referenceProps.modelWrapper.model.meta.namespace
      ].mappings[editMappingProps.from][editMappingProps.to] = update;
      setMapProfile({ ...mapProfile });
    }
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function onMappingDelete() {
    const { from, to } = editMappingProps;
    const mapSet =
      mapProfile.mapSet[referenceProps.modelWrapper.model.meta.namespace];
    delete mapSet.mappings[from][to];
    if (Object.keys(mapSet.mappings[from]).length === 0) {
      delete mapSet.mappings[from];
    }
    setMapProfile({ ...mapProfile });
    setEditMProps({
      from: '',
      to: '',
    });
    updateMapStyle({ mp: mapProfile });    
  }

  if (!isVisible && selected.selected !== '') {
    setSelected({
      modelType: ModelType.IMP,
      selected: '',
    });
  }

  function onImpNavigate(id: string) {
    const page = findPageContainingElement(impmodel, id);
    const hm = implementProps.historyMap;
    processNavigate(page, setImplProps, implementProps, hm);
  }

  function onRefNavigate(id: string) {
    const page = findPageContainingElement(refmodel, id);
    const hm = referenceProps.historyMap;        
    processNavigate(page, setRefProps, referenceProps, hm);
  }

  function processNavigate(
    page: EditorSubprocess|null, 
    setProps: (s:MapperState) => void,
    props: MapperState,
    hm?: Record<string, PageHistory>
  ) {    
    if (page !== null && hm !== undefined && hm[page.id] !== undefined) {
      setProps({...props, modelWrapper:{...props.modelWrapper, page: page.id}, history: hm[page.id]});
    } else {
      alert('Target not found');
    }
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperFileMenu
            mapProfile={mapProfile}
            onMapProfileChanged={onMapProfileChanged}
          />
        }
      >
        <MGDButton> Mapping </MGDButton>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperOptionMenu
            viewOption={viewOption}
            setOptions={setViewOption}
          />
        }
      >
        <MGDButton> View </MGDButton>
      </Popover2>
      <MGDButton
        onClick={() => setViewOption({ ...viewOption, docVisible: true })}
      >
        Report
      </MGDButton>
    </ControlGroup>
  );

  const mapEditPage =
    editMappingProps.from !== '' && editMappingProps.to !== '' ? (
      <MappingEditPage
        from={
          implementProps.modelWrapper.model.elements[editMappingProps.from] as
            | EditorProcess
            | EditorApproval
        }
        to={
          referenceProps.modelWrapper.model.elements[editMappingProps.to] as
            | EditorProcess
            | EditorApproval
        }
        data={
          mapProfile.mapSet[refns].mappings[editMappingProps.from][
            editMappingProps.to
          ]
        }
        onDelete={onMappingDelete}
        onChange={onMappingChange}
      />
    ) : (
      <></>
    );

  if (isVisible) {
    return (      
      <Workspace className={className} toolbar={toolbar}>
        <Dialog
          isOpen={editMappingProps.from !== '' || viewOption.docVisible}
          title={
            editMappingProps.from !== '' ? 'Edit Mapping' : 'Report template'
          }
          css={dialog_layout}
          onClose={
            editMappingProps.from !== ''
              ? () =>
                  setEditMProps({
                    from: '',
                    to: '',
                  })
              : () => setViewOption({ ...viewOption, docVisible: false })
          }
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          {editMappingProps.from !== '' ? (
            mapEditPage
          ) : (
            <DocTemplatePane
              mapProfile={mapProfile}
              setMapProfile={setMapProfile}
              refModel={referenceProps.modelWrapper.model}
              impModel={implementProps.modelWrapper.model}
            />
          )}
        </Dialog>
        <div css={mappper_container}>
          <ModelDiagram
            modelProps={implementProps}
            viewOption={viewOption}
            setProps={onImpPropsChange}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            onModelChanged={onImpModelChanged}
            setSelected={setSelected}    
            onMappingEdit={onMappingEdit}
            issueNavigationRequest={onRefNavigate}
            getPartnerModelElementById={id => getEditorNodeById(refmodel, id)}
          />
          <div ref={lineref} css={vertical_line} />
          <ModelDiagram
            modelProps={referenceProps}
            viewOption={viewOption}
            setProps={onRefPropsChange}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            mapResult={mapResult}
            onModelChanged={onRefModelChanged}
            setSelected={setSelected}   
            onMappingEdit={onMappingEdit}
            issueNavigationRequest={onImpNavigate}
            getPartnerModelElementById={id => getEditorNodeById(impmodel, id)}
          />            
        </div>
        <MappingCanvus mapEdges={mapEdges} line={lineref}/>
      </Workspace>      
    );
  }
  return <></>;
};

export default ModelMapper;
