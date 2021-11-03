import { Dialog, IToastProps } from '@blueprintjs/core';
import React from 'react';
import { dialogLayout } from '../../../css/layout';
import { EditorApproval, EditorProcess } from '../../model/editormodel';
import { MappingMeta, MapProfile } from '../../model/mapmodel';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  isModelWrapper,
  MapperViewOption,
  ReferenceContent,
} from '../../model/States';
import { getDocumentMetaById } from '../../utils/DocumentFunctions';
import { getNamespace } from '../../utils/ModelFunctions';
import { EditMPropsInterface } from '../dialog/dialogs';
import MappingEditPage from '../edit/mappingedit';
import AutoMapper from '../mapper/AutoMapper';
import DocTemplatePane from '../reporttemplate/doctemplatepane';

type MapperDialogMode = 'mapping' | 'report' | 'automap';

type MapperDiagConfig = {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
};

const MapperDialog: React.FC<{
  editMappingProps: EditMPropsInterface;
  mapProfile: MapProfile;
  viewOption: MapperViewOption;
  impMW: ModelWrapper;
  refMW: ReferenceContent;
  setMapProfile: (x: MapProfile) => void;
  setEditMProps: (x: EditMPropsInterface) => void;
  setViewOption: (x: MapperViewOption) => void;
  showMessage: (msg: IToastProps) => void;
}> = function ({
  editMappingProps,
  mapProfile,
  refMW,
  impMW,
  setMapProfile,
  setEditMProps,
  viewOption,
  setViewOption,
  showMessage,
}) {
  const refns = isModelWrapper(refMW) ? getNamespace(refMW.model) : refMW.id;
  const impmodel = impMW.model;

  function onMappingChange(update: MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[refns].mappings[editMappingProps.from][
        editMappingProps.to
      ] = update;
      setMapProfile({ ...mapProfile });
    }
    clearMappingProps();
  }

  function clearMappingProps() {
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function closeDialog() {
    setViewOption({ ...viewOption, docVisible: false, mapAIVisible: false });
  }

  function onMappingDelete() {
    const { from, to } = editMappingProps;
    const mapSet = mapProfile.mapSet[refns];
    delete mapSet.mappings[from][to];
    mapSet.mappings[from] = { ...mapSet.mappings[from] };
    if (Object.keys(mapSet.mappings[from]).length === 0) {
      delete mapSet.mappings[from];
    }
    mapSet.mappings = { ...mapSet.mappings };
    setMapProfile({ ...mapProfile });
    setEditMProps({
      from: '',
      to: '',
    });
  }

  const mapEditPage = editMappingProps.from !== '' &&
    editMappingProps.to !== '' && (
      <MappingEditPage
        from={
          impmodel.elements[editMappingProps.from] as
            | EditorProcess
            | EditorApproval
        }
        to={
          isModelWrapper(refMW)
            ? (refMW.model.elements[editMappingProps.to] as
                | EditorProcess
                | EditorApproval)
            : {
                id: editMappingProps.to,
                name: getDocumentMetaById(refMW, editMappingProps.to),
              }
        }
        data={
          mapProfile.mapSet[refns].mappings[editMappingProps.from][
            editMappingProps.to
          ]
        }
        onDelete={onMappingDelete}
        onChange={onMappingChange}
      />
    );

  const docEditPage = isModelWrapper(refMW) && (
    <DocTemplatePane
      mapProfile={mapProfile}
      setMapProfile={setMapProfile}
      refModel={refMW.model}
      impModel={impmodel}
    />
  );

  const autoMapPage = (
    <AutoMapper
      refNamespace={refns}
      impNamespace={getNamespace(impmodel)}
      showMessage={showMessage}
      onClose={closeDialog}
      mapProfile={mapProfile}
      setMapProfile={setMapProfile}
    />
  );

  const MapperConfig: Record<MapperDialogMode, MapperDiagConfig> = {
    mapping: {
      title: 'Edit Mapping',
      content: mapEditPage,
      onClose: clearMappingProps,
    },
    report: {
      title: 'Report template',
      content: docEditPage,
      onClose: closeDialog,
    },
    automap: {
      title: 'Auto mapper (transitive mapping)',
      content: autoMapPage,
      onClose: closeDialog,
    },
  };

  const mode = checkDiagMode(editMappingProps, viewOption);
  if (mode !== undefined) {
    const config = MapperConfig[mode];

    return (
      <Dialog
        isOpen={mode !== undefined}
        title={config.title}
        style={dialogLayout}
        onClose={config.onClose}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        {config.content}
      </Dialog>
    );
  } else {
    return <></>;
  }
};

function checkDiagMode(
  map: EditMPropsInterface,
  option: MapperViewOption
): MapperDialogMode | undefined {
  if (map.from !== '') {
    return 'mapping';
  }
  if (option.docVisible) {
    return 'report';
  }
  if (option.mapAIVisible) {
    return 'automap';
  }
  return undefined;
}

export default MapperDialog;
