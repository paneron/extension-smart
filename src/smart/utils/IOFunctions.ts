import { Hooks, SaveDialogProps } from '@riboseinc/paneron-extension-kit/types';
import { EditorModel } from '../model/editormodel';
import { MapProfile } from '../model/mapmodel';
import { createEditorModelWrapper, ModelWrapper } from '../model/modelwrapper';
import { SMARTWorkspace } from '../model/workspace';
import { textToMMEL } from '../serialize/MMEL';
import { LoggerInterface, OpenFileInterface } from './constants';

export interface FileTypeDescriptionInterface {
  filtername: string;
  extension: string;
  openPrompt?: string;
}

export enum FILE_TYPE {
  Model = 'model',
  Report = 'report',
  Map = 'mapping',
  Workspace = 'workspace',
}

export const FileTypeDescription: Record<
  FILE_TYPE,
  FileTypeDescriptionInterface
> = {
  [FILE_TYPE.Model]: {
    filtername: 'MMEL files',
    extension: 'mmel',
    openPrompt: 'Choose a model file to open',
  },
  [FILE_TYPE.Report]: {
    filtername: 'All files',
    extension: '*',
  },
  [FILE_TYPE.Map]: {
    filtername: 'MAP files',
    extension: 'map',
    openPrompt: 'Choose a mapping file to open',
  },
  [FILE_TYPE.Workspace]: {
    filtername: 'Workspace files',
    extension: 'sws',
    openPrompt: 'Choose a SMART workspace file to open',
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
    const mw = createEditorModelWrapper(model);
    if (indexModel !== undefined) {
      indexModel(mw.model);
    }
    setModelWrapper(mw);
  } catch (e) {
    logger?.log('Failed to load model', e);
  }
}

export function handleModelOpen(props: {
  setModelWrapper: (m: ModelWrapper) => void;
  useDecodedBlob?: Hooks.UseDecodedBlob;
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

export function handleWSOpen(props: {
  setWorkspace: (ws: SMARTWorkspace) => void;
  useDecodedBlob?: Hooks.UseDecodedBlob;
  requestFileFromFilesystem?: OpenFileInterface;
}) {
  const { setWorkspace } = props;
  handleFileOpen({
    ...props,
    type: FILE_TYPE.Workspace,
    postProcessing: data => setWorkspace(JSON.parse(data) as SMARTWorkspace),
  });
}

export function handleMappingOpen(props: {
  onMapProfileChanged: (mp: MapProfile) => void;
  useDecodedBlob?: Hooks.UseDecodedBlob;
  requestFileFromFilesystem?: OpenFileInterface;
}) {
  const { onMapProfileChanged } = props;
  handleFileOpen({
    ...props,
    type: FILE_TYPE.Map,
    postProcessing: data => onMapProfileChanged(JSON.parse(data) as MapProfile),
  });
}

export async function handleFileOpen(props: {
  useDecodedBlob?: Hooks.UseDecodedBlob;
  requestFileFromFilesystem?: OpenFileInterface;
  logger?: LoggerInterface;
  indexModel?: (model: EditorModel) => void;
  type: FILE_TYPE;
  postProcessing: (data: string) => void;
}) {
  const {
    useDecodedBlob,
    requestFileFromFilesystem,
    logger,
    type,
    postProcessing,
  } = props;
  if (requestFileFromFilesystem && useDecodedBlob) {
    const desc = FileTypeDescription[type];
    logger?.log('Requesting file');
    requestFileFromFilesystem(
      {
        prompt: desc.openPrompt ?? '',
        allowMultiple: false,
        filters: [{ name: desc.filtername, extensions: [desc.extension] }],
      },
      selectedFiles => {
        logger?.log('Requesting file: Got selection');
        const fileData = Object.values(selectedFiles ?? {})[0];
        logger?.log('File data');
        if (fileData) {
          const fileDataAsString = useDecodedBlob({
            blob: fileData,
          }).asString;
          logger?.log(
            'Requesting file: Decoded blob',
            fileDataAsString.substring(0, Math.min(20, fileDataAsString.length))
          );
          postProcessing(fileDataAsString);
        } else {
          logger?.log('Requesting file: No file data received');
          console.error('Import file: no file data received');
        }
      }
    );
  } else {
    throw new Error('File import function not availbale');
  }
}

export async function saveToFileSystem(props: {
  getBlob?: (value: string) => Promise<Uint8Array>;
  writeFileToFilesystem?: (opts: {
    dialogOpts: SaveDialogProps;
    bufferData: Uint8Array;
  }) => Promise<{
    success: true;
    savedToFileAtPath: string;
  }>;
  fileData: string;
  type: FILE_TYPE;
}) {
  const { getBlob, writeFileToFilesystem, fileData, type } = props;
  if (getBlob && writeFileToFilesystem) {
    const desc = FileTypeDescription[type];
    const blob = await getBlob(fileData);
    await writeFileToFilesystem({
      dialogOpts: {
        prompt: 'Choose location to save',
        filters: [{ name: desc.filtername, extensions: [desc.extension] }],
      },
      bufferData: blob,
    });
  } else {
    throw new Error('File export function(s) are not provided');
  }
}
