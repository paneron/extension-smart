import { SaveFileDialogProps } from '@riboseinc/paneron-extension-kit/types/dialogs';
import { MMELDocument } from '../model/document';
import { EditorModel } from '../model/editormodel';
import { MapProfile } from '../model/mapmodel';
import { createEditorModelWrapper, ModelWrapper } from '../model/modelwrapper';
import { SMARTWorkspace } from '../model/workspace';
import { textToMMEL } from '../serialize/MMEL';
import {
  LoggerInterface,
  MAPVERSION,
  MODELVERSION,
  OpenFileInterface,
  WSVERSION,
} from './constants';
import { textToDoc } from './DocumentFunctions';
import { Logger } from './ModelFunctions';
import { bsiToDocument } from './xml/BSIXML';
import { xmlToDocument } from './xml/XMLDocumentFunctions';

export interface FileTypeDescriptionInterface {
  filtername: string;
  extension: string[];
  openPrompt?: string;
}

export enum FILE_TYPE {
  Model = 'model',
  Report = 'report',
  Map = 'mapping',
  Workspace = 'workspace',
  JSON = 'json',
  Document = 'doc',
  XML = 'xml',
  CSV = 'csv',
  BSI = 'bsi',
  IMG = 'img',
}

export const FileTypeDescription: Record<
  FILE_TYPE,
  FileTypeDescriptionInterface
> = {
  [FILE_TYPE.Model]: {
    filtername: 'MMEL files',
    extension: ['mmel'],
    openPrompt: 'Choose a model file to open',
  },
  [FILE_TYPE.Report]: {
    filtername: 'Ascii Doc files',
    extension: ['adoc'],
  },
  [FILE_TYPE.Map]: {
    filtername: 'MAP files',
    extension: ['map'],
    openPrompt: 'Choose a mapping file to open',
  },
  [FILE_TYPE.Workspace]: {
    filtername: 'Workspace files',
    extension: ['sws'],
    openPrompt: 'Choose a SMART workspace file to open',
  },
  [FILE_TYPE.JSON]: {
    filtername: 'JSON files',
    extension: ['json'],
    openPrompt: 'Choose a JSON file to open',
  },
  [FILE_TYPE.Document]: {
    filtername: 'SMART document files',
    extension: ['sdc'],
    openPrompt: 'Choose a SMART document file to open',
  },
  [FILE_TYPE.XML]: {
    filtername: 'XML files',
    extension: ['xml'],
    openPrompt: 'Choose an XML file to open',
  },
  [FILE_TYPE.CSV]: {
    filtername: 'CSV files',
    extension: ['csv'],
    openPrompt: 'Choose a CSV file to open',
  },
  [FILE_TYPE.BSI]: {
    filtername: 'BSI XML files',
    extension: ['xml'],
    openPrompt: 'Choose a BSI XML file to open',
  },
  [FILE_TYPE.IMG]: {
    filtername: 'Image files',
    extension: ['jpg', 'png'],
    openPrompt: 'Choose an image file to open',
  },
};

// Open
function parseModel(props: {
  data: string;
  setModelWrapper: (m: ModelWrapper) => void;
  logger?: LoggerInterface;
  indexModel?: (model: EditorModel) => void;
}) {
  const { data, setModelWrapper, logger, indexModel } = props;
  logger?.log('Importing model');
  try {
    const model = textToMMEL(data);
    if (model.version !== MODELVERSION) {
      alert(
        `Warning: Model version not matched\nModel version of the file:${model.version}`
      );
      model.version = MODELVERSION;
    }
    const mw = createEditorModelWrapper(model);
    if (indexModel !== undefined) {
      indexModel(mw.model);
    }
    setModelWrapper(mw);
  } catch (e: unknown) {
    const err = e as Error;
    alert(`Failed to load model. Message: ${err.message ?? ''}`);
    if (err.message !== undefined && err.stack !== undefined) {
      logger?.log(err.message);
      logger?.log(err.stack);
    }
  }
}

export function handleModelOpen(props: {
  setModelWrapper: (m: ModelWrapper) => void;
  requestFileFromFilesystem?: OpenFileInterface;
  logger?: LoggerInterface;
  indexModel?: (model: EditorModel) => void;
}) {
  const { setModelWrapper, logger, indexModel } = props;
  handleFileOpen({
    ...props,
    type: FILE_TYPE.Model,
    postProcessing: data =>
      parseModel({
        data,
        setModelWrapper,
        logger,
        indexModel,
      }),
  });
}

export function handleDocumentOpen(props: {
  setDocument: (doc: MMELDocument) => void;
  requestFileFromFilesystem?: OpenFileInterface;
  fileType: FILE_TYPE.Document | FILE_TYPE.XML | FILE_TYPE.BSI;
}) {
  try {
    const { setDocument, fileType } = props;
    handleFileOpen({
      ...props,
      type: fileType,
      postProcessing: data =>
        setDocument(
          fileType === FILE_TYPE.Document
            ? textToDoc(data)
            : fileType === FILE_TYPE.XML
            ? xmlToDocument(data)
            : bsiToDocument(data)
        ),
    });
  } catch (e: unknown) {
    const err = e as Error;
    alert(`Failed to open document. Message: ${err.message ?? ''}`);
  }
}

export function handleWSOpen(props: {
  setWorkspace: (ws: SMARTWorkspace) => void;
  requestFileFromFilesystem?: OpenFileInterface;
}) {
  try {
    const { setWorkspace } = props;
    handleFileOpen({
      ...props,
      type: FILE_TYPE.Workspace,
      postProcessing: data => {
        const ws = JSON.parse(data) as SMARTWorkspace;
        if (ws.version !== WSVERSION) {
          alert(
            `Warning: Workspace version not matched\nWorkspace version of the file:${ws.version}`
          );
          ws.version = WSVERSION;
        }
        setWorkspace(ws);
      },
    });
  } catch (e: unknown) {
    const err = e as Error;
    alert(`Failed to open workspace. Message: ${err.message ?? ''}`);
  }
}

export function handleMappingOpen(props: {
  onMapProfileChanged: (mp: MapProfile) => void;
  requestFileFromFilesystem?: OpenFileInterface;
  fileType?: FILE_TYPE;
}) {
  try {
    const { onMapProfileChanged, fileType } = props;
    handleFileOpen({
      ...props,
      type: fileType ?? FILE_TYPE.Map,
      postProcessing: data => {
        const mp = JSON.parse(data) as MapProfile;
        if (mp.version !== MAPVERSION) {
          alert(
            `Warning: Mapping version not matched\nMapping version of the file:${mp.version}`
          );
          mp.version = MAPVERSION;
        }
        onMapProfileChanged(mp);
      },
    });
  } catch (e: unknown) {
    const err = e as Error;
    alert(`Failed to open mapping. Message: ${err.message ?? ''}`);
  }
}

export async function handleFileOpen(props: {
  requestFileFromFilesystem?: OpenFileInterface;
  logger?: LoggerInterface;
  type: FILE_TYPE;
  postProcessing: (data: string) => void;
  base64?: boolean;
}) {
  const { requestFileFromFilesystem, logger, type, postProcessing, base64 } =
    props;
  try {
    if (requestFileFromFilesystem) {
      const desc = FileTypeDescription[type];
      logger?.log('Requesting file');
      requestFileFromFilesystem(
        {
          prompt: desc.openPrompt ?? '',
          allowMultiple: false,
          filters: [{ name: desc.filtername, extensions: desc.extension }],
        },
        selectedFiles => {
          try {
            logger?.log('Requesting file: Got selection');
            const fileData = Object.values(selectedFiles ?? {})[0];
            logger?.log('File data');
            if (fileData) {
              if (type === FILE_TYPE.JSON) {
                postProcessing(JSON.stringify(fileData));
              } else if (base64) {
                if (fileData['asBase64'] !== undefined) {
                  postProcessing(fileData['asBase64']);
                } else {
                  alert('No base64 data is found.');
                }
              } else {
                if (fileData['asText'] !== undefined) {
                  postProcessing(fileData['asText']);
                } else {
                  alert('No text data is found.');
                  Logger.logger.log(Object.keys(fileData).join(','));
                  Logger.logger.log(Object.values(fileData).join(','));
                }
              }
            } else {
              logger?.log('Requesting file: No file data received');
              console.error('Import file: no file data received');
            }
          } catch (e: unknown) {
            const err = e as Error;
            alert(`Failed to open file. Message: ${err.message ?? ''}`);
          }
        }
      );
    } else {
      throw new Error('File import function not availbale');
    }
  } catch (e: unknown) {
    const err = e as Error;
    alert(`Failed to open file. Message: ${err.message ?? ''}`);
  }
}

export async function saveToFileSystem(props: {
  getBlob?: (value: string) => Promise<Uint8Array>;
  writeFileToFilesystem?: (opts: {
    dialogOpts: SaveFileDialogProps;
    bufferData: Uint8Array;
  }) => Promise<{
    success: true;
    savedToFileAtPath: string;
  }>;
  fileData: string;
  type: FILE_TYPE;
}): Promise<string> {
  const { getBlob, writeFileToFilesystem, fileData, type } = props;
  if (getBlob && writeFileToFilesystem) {
    const desc = FileTypeDescription[type];
    const blob = await getBlob(fileData);
    const { savedToFileAtPath } = await writeFileToFilesystem({
      dialogOpts: {
        prompt: 'Choose location to save',
        filters: [{ name: desc.filtername, extensions: desc.extension }],
      },
      bufferData: blob,
    });
    return savedToFileAtPath;
  } else {
    throw new Error('File export function(s) are not provided');
  }
}
