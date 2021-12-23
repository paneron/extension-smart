import { Button, ButtonGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo, useState } from 'react';
import { Edge, Elements, Node } from 'react-flow-renderer';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { MMELJSON } from '../../../model/json';
import { MapProfile } from '../../../model/mapmodel';
import {
  createEditorModelWrapper,
  ModelWrapper,
} from '../../../model/modelwrapper';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { repoAutoMapExplore, repoMapAI } from '../../../utils/map/AutoMap';
import { Logger } from '../../../utils/ModelFunctions';
import {
  getAllRepoMaps,
  getAllRepoModels,
  getRepoItemDesc,
} from '../../../utils/repo/CommonFunctions';
import { JSONToMMEL } from '../../../utils/repo/io';
import { createAutoMapNode } from './automapper/AutoMapNode';
import AutoMapLoading from './automapper/calculating';
import RepoLoading from './automapper/loading';
import RepoAutoMapView from './automapper/mapview';

type Status = 'initial' | 'run' | 'done';

const instructions: [JSX.Element, JSX.Element, JSX.Element, JSX.Element] = [
  <>
    <p> Steps to use the auto mapper </p>
    <ol>
      <li>Wait until mapping information is loaded</li>
      <li>Select relevant model as a bridge to discover new mappings</li>
      <li>Select destination model to be covered</li>
      <li>Calculate transitive mapping</li>
    </ol>
  </>,
  <h3>Select relevant model as a bridge to discover new mappings</h3>,
  <h3>Select destination model to be covered</h3>,
  <h3>Calculate transitive mapping</h3>,
];

const RepoAutoMapper: React.FC<{
  repo: MMELRepo;
  map: MapProfile;
  index: RepoIndex;
  setMapProfile: (x: MapProfile) => void;
  finish: () => void;
}> = function ({ repo, index, map, setMapProfile, finish }) {
  const { useObjectData } = useContext(DatasetContext);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState<Status>('initial');
  const [elms, setElms] = useState<Record<string, Node>>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [froms, setFroms] = useState<Record<string, boolean>>({});
  const [tos, setTos] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<string>('');

  const mapFiles = useObjectData({
    objectPaths: getAllRepoMaps(index),
  });

  const modelFiles = useObjectData({
    objectPaths: getAllRepoModels(index),
  });

  const maps: Record<string, MapProfile> = useMemo(() => {
    if (!mapFiles.isUpdating) {
      return Object.entries(mapFiles.value.data).reduce<
        Record<string, MapProfile>
      >(
        (obj, [ns, x]) =>
          x !== null ? { ...obj, [ns]: x as MapProfile } : obj,
        {}
      );
    }
    return {};
  }, [mapFiles.isUpdating]);

  const models: Record<string, ModelWrapper> = useMemo(() => {
    if (!modelFiles.isUpdating) {
      return Object.entries(modelFiles.value.data).reduce<
        Record<string, ModelWrapper>
      >(
        (obj, [ns, x]) =>
          x !== null
            ? {
                ...obj,
                [ns]: createEditorModelWrapper(JSONToMMEL(x as MMELJSON)),
              }
            : obj,
        {}
      );
    }
    return {};
  }, [modelFiles.isUpdating]);

  const Compos = [
    RepoLoading,
    RepoAutoMapView,
    RepoAutoMapView,
    AutoMapLoading,
  ];

  const isUpdating = mapFiles.isUpdating || modelFiles.isUpdating;

  const buttonDisabled = checkButtonDisabled(
    step,
    isUpdating,
    running,
    froms,
    tos
  );
  const isDoable = Object.keys(froms).length > 0 && Object.keys(tos).length > 0;
  const fin = !isDoable || step === 3;

  const fnodes = useMemo(
    () => calNodes(step, elms, edges, index, froms, tos, setFroms, setTos),
    [step, elms, edges, froms, tos]
  );

  const props = {
    isLoading: buttonDisabled,
    isDoable,
    nextStep: () => setStep(step + 1),
    step,
    fnodes,
    result,
  };

  const Compo = Compos[step];

  if (step === 0 && !isUpdating) {
    if (running === 'initial') {
      setRunning('run');
      repoAutoMapExplore(repo, index, map, maps).then(x => {
        const [elms, edges, froms, tos] = x;
        setElms(elms);
        setEdges(edges);
        setFroms(froms);
        setTos(tos);
        setRunning('done');
      });
    }
  }

  function onSelectAll(s: number, b: boolean) {
    const newValue = s === 1 ? { ...froms } : { ...tos };
    for (const x in newValue) {
      newValue[x] = b;
    }
    s === 1 ? setFroms(newValue) : setTos(newValue);
  }

  function onSetStep(x: number) {
    setStep(x);
    if (x > 0 && x < 3) {
      onSelectAll(x, false);
    }
    if (x === 3) {
      setRunning('run');
      repoMapAI(map, maps, models, froms, tos)
        .then(x => {
          const [newMap, result] = x;
          setMapProfile(newMap);
          if (result === 0) {
            setResult('No new mapping is discovered');
          } else {
            setResult(`${result} mappings are found and added`);
          }
          setRunning('done');
        })
        .catch(e => {
          Logger.log(e.message);
          Logger.log(e.stack);
        });
    }
  }

  return (
    <MGDDisplayPane>
      {instructions[step]}
      {step > 0 && step < 3 && (
        <SelectButtonPane onSelectAll={b => onSelectAll(step, b)} />
      )}
      <fieldset>
        <legend>Step {step + 1}</legend>
        <div style={{ position: 'relative' }}>
          <Container>
            <Compo {...props} />
          </Container>
        </div>
      </fieldset>
      <ButtonPane
        fin={fin}
        disabled={buttonDisabled}
        step={step}
        setStep={fin ? finish : onSetStep}
      />
    </MGDDisplayPane>
  );
};

const Container: React.FC<{ children: React.ReactNode }> = function ({
  children,
}) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: 300,
        background: 'white',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
};

const ButtonPane: React.FC<{
  disabled: boolean;
  step: number;
  setStep: (x: number) => void;
  fin: boolean;
}> = function ({ step, setStep, disabled, fin }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 60 }}>
      {step > 0 && step < 3 && (
        <Button large onClick={() => setStep(step - 1)}>
          Back
        </Button>
      )}
      <Button disabled={disabled} large onClick={() => setStep(step + 1)}>
        {!disabled && fin ? 'Done' : 'Next'}
      </Button>
    </div>
  );
};

const SelectButtonPane: React.FC<{ onSelectAll: (b: boolean) => void }> =
  function ({ onSelectAll }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonGroup>
          <Button onClick={() => onSelectAll(true)}>Select all</Button>
          <Button onClick={() => onSelectAll(false)}>Deselect all</Button>
        </ButtonGroup>
      </div>
    );
  };

function checkButtonDisabled(
  step: number,
  isUpdating: boolean,
  isRunning: Status,
  froms: Record<string, boolean>,
  tos: Record<string, boolean>
): boolean {
  switch (step) {
    case 0:
      return isUpdating || isRunning !== 'done';
    case 1:
      return Object.values(froms).filter(x => x).length === 0;
    case 2:
      return Object.values(tos).filter(x => x).length === 0;
    default:
      return isRunning !== 'done';
  }
}

function fillContents(
  k: string,
  v: Node,
  index: RepoIndex,
  config: Record<string, boolean>,
  setConfig: (x: Record<string, boolean>) => void
): Node {
  const item = index[k];
  const c = config[k];
  return {
    ...v,
    data: {
      label: createAutoMapNode(
        item ? getRepoItemDesc(item) : k,
        item,
        c,
        c !== undefined ? x => setConfig({ ...config, [k]: x }) : undefined
      ),
    },
  };
}

function calNodes(
  step: number,
  elms: Record<string, Node>,
  edges: Edge[],
  index: RepoIndex,
  froms: Record<string, boolean>,
  tos: Record<string, boolean>,
  setFroms: (x: Record<string, boolean>) => void,
  setTos: (x: Record<string, boolean>) => void
): Elements {
  if (step === 1 || step === 2) {
    const [setting, setSetting] =
      step === 1 ? [froms, setFroms] : [tos, setTos];
    const nodes = Object.entries(elms).map(([k, v]) =>
      fillContents(k, v, index, setting, setSetting)
    );
    return [...nodes, ...edges];
  }
  return [];
}

export default RepoAutoMapper;
