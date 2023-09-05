import type { SaveFileDialogProps } from '@riboseinc/paneron-extension-kit/types/dialogs';
import type { MMELDocument } from '@/smart/model/document';
import type { EditorModel } from '@/smart/model/editormodel';
import type { MapProfile } from '@/smart/model/mapmodel';
import type { ModelWrapper } from '@/smart/model/modelwrapper';
import { mmelFile } from '@riboseinc/paneron-extension-kit/object-specs/ser-des';
import { encoder as string2uint8ArrayEncoder } from '@riboseinc/paneron-extension-kit/util';
import type { MMELModel } from '@paneron/libmmel/interface/model';

import { createEditorModelWrapper } from '@/smart/model/modelwrapper';
import type { SMARTWorkspace } from '@/smart/model/workspace';
import type {
  LoggerInterface,
  OpenFileInterface } from '@/smart/utils/constants';
import {
  MAPVERSION,
  MODELVERSION,
  WSVERSION,
} from '@/smart/utils/constants';
import { textToDoc } from '@/smart/utils/DocumentFunctions';
import * as Logger from '@/lib/logger';
import { bsiToDocument } from '@/smart/utils/xml/BSIXML';
import { xmlToDocument } from '@/smart/utils/xml/XMLDocumentFunctions';

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
  VIDEO = 'video',
}

export const FileTypeDescription: Record<
  FILE_TYPE,
  FileTypeDescriptionInterface
> = {
  [FILE_TYPE.Model] : {
    filtername : 'MMEL files',
    extension  : ['mmel'],
    openPrompt : 'Choose a model file to open',
  },
  [FILE_TYPE.Report] : {
    filtername : 'Ascii Doc files',
    extension  : ['adoc'],
  },
  [FILE_TYPE.Map] : {
    filtername : 'MAP files',
    extension  : ['map'],
    openPrompt : 'Choose a mapping file to open',
  },
  [FILE_TYPE.Workspace] : {
    filtername : 'Workspace files',
    extension  : ['sws'],
    openPrompt : 'Choose a SMART workspace file to open',
  },
  [FILE_TYPE.JSON] : {
    filtername : 'JSON files',
    extension  : ['json'],
    openPrompt : 'Choose a JSON file to open',
  },
  [FILE_TYPE.Document] : {
    filtername : 'SMART document files',
    extension  : ['sdc'],
    openPrompt : 'Choose a SMART document file to open',
  },
  [FILE_TYPE.XML] : {
    filtername : 'XML files',
    extension  : ['xml'],
    openPrompt : 'Choose an XML file to open',
  },
  [FILE_TYPE.CSV] : {
    filtername : 'CSV files',
    extension  : ['csv'],
    openPrompt : 'Choose a CSV file to open',
  },
  [FILE_TYPE.BSI] : {
    filtername : 'BSI XML files',
    extension  : ['xml'],
    openPrompt : 'Choose a BSI XML file to open',
  },
  [FILE_TYPE.IMG] : {
    filtername : 'Image files',
    extension  : ['jpg', 'png'],
    openPrompt : 'Choose an image file to open',
  },
  [FILE_TYPE.VIDEO] : {
    filtername : 'Video files',
    extension  : ['mov'],
    openPrompt : 'Choose a video file to open',
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
    const placeholderPath = '/';
    const model = mmelFile.deserialize({ placeholderPath : string2uint8ArrayEncoder.encode(data) }, {}) as MMELModel;
    if (model.version !== MODELVERSION) {
      Logger.error(
        `Warning: Model versions do not match.\nModel version of file: ${model.version}.\nExpected: ${MODELVERSION}.\nContinuing anyway.`
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
    type           : FILE_TYPE.Model,
    postProcessing : data =>
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
      type           : fileType,
      postProcessing : data =>
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
      type           : FILE_TYPE.Workspace,
      postProcessing : data => {
        const ws = JSON.parse(data) as SMARTWorkspace;
        if (ws.version !== WSVERSION) {
          Logger.error(
            `Warning: Workspace versions do not match.\nWorkspace version of file: ${ws.version}.\nExpected: ${WSVERSION}.\nContinuing anyway.`
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
      type           : fileType ?? FILE_TYPE.Map,
      postProcessing : data => {
        const mp = JSON.parse(data) as MapProfile;
        if (mp.version !== MAPVERSION) {
          Logger.error(
            `Warning: Mapping versions do not match.\nMapping version of file: ${mp.version}.\nExpected: ${MAPVERSION}.\nContinuing anyway.`
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
          prompt        : desc.openPrompt ?? '',
          allowMultiple : false,
          filters       : [{ name : desc.filtername, extensions : desc.extension }],
        },
        selectedFiles => {
          try {
            logger?.log('Requesting file: Got selection');
            const fileData = Object.values(selectedFiles ?? {})[0];
            logger?.log('File data');
            if (fileData) {
              if (type === FILE_TYPE.JSON) {
                postProcessing(JSON.stringify(fileData, undefined, 2));
              } else if (base64) {
                if (fileData.asBase64 !== undefined) {
                  postProcessing(fileData.asBase64);
                } else {
                  alert('No base64 data is found.');
                  Logger.log(Object.keys(fileData).join(','));
                  Logger.log(Object.values(fileData).join(','));
                }
              } else {
                if (fileData.asText !== undefined) {
                  postProcessing(fileData.asText);
                } else {
                  alert('No text data is found.');
                  Logger.log(Object.keys(fileData).join(','));
                  Logger.log(Object.values(fileData).join(','));
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
  fileData: string | Uint8Array;
  type: FILE_TYPE;
}): Promise<string> {
  const { getBlob, writeFileToFilesystem, fileData, type } = props;
  if (getBlob && writeFileToFilesystem) {
    const desc = FileTypeDescription[type];
    const blob = (typeof fileData === 'string') ?
      await getBlob(fileData) :
      fileData;
    const { savedToFileAtPath } = await writeFileToFilesystem({
      dialogOpts : {
        prompt  : 'Choose location to save',
        filters : [{ name : desc.filtername, extensions : desc.extension }],
      },
      bufferData : blob,
    });
    return savedToFileAtPath;
  } else {
    throw new Error('File export function(s) are not provided');
  }
}
