import { Button } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React, { useContext, useMemo, useState } from 'react';
import { Edge, Elements, Node } from 'react-flow-renderer';
import MGDDisplayPane from '../../../MGDComponents/MGDDisplayPane';
import { MapProfile } from '../../../model/mapmodel';
import { MMELRepo, RepoIndex } from '../../../model/repo';
import { repoAutoMapExplore } from '../../../utils/map/AutoMap';
import { getAllRepoMaps } from '../../../utils/repo/CommonFunctions';
import { createAutoMapNode } from './automapper/AutoMapNode';
import RepoLoading from './automapper/loading';
import RepoAutoMapView from './automapper/mapview';

type Status = 'initial' | 'run' | 'done';

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

  const mapFiles = useObjectData({
    objectPaths: getAllRepoMaps(index),
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

  const Compos = [RepoLoading, RepoAutoMapView];

  const isLoading = checkLoading(step, mapFiles.isUpdating, running);
  const isDoable = Object.keys(froms).length > 0 && Object.keys(tos).length > 0;
  const fin = !isDoable || step === 3;

  const fnodes = useMemo(
    () => calNodes(step, elms, edges, index, froms, tos, setFroms, setTos),
    [step, elms, edges, froms, tos]
  );

  const props = {
    isLoading,
    isDoable,
    nextStep: () => setStep(step + 1),
    step,
    fnodes,
  };

  const Compo = Compos[step];

  if (step === 0 && !mapFiles.isUpdating) {
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

  return (
    <MGDDisplayPane>
      <p> Steps to use the auto mapper </p>
      <ol>
        <li>Wait until mapping information is loaded</li>
        <li>Select relevant model as a bridge to discover new mappings</li>
        <li>Select destination model to be covered</li>
        <li>Calculate transitive mapping</li>
      </ol>
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
        disabled={isLoading}
        step={step}
        setStep={fin ? finish : setStep}
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
      {step !== 0 && (
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

function checkLoading(
  step: number,
  isUpdating: boolean,
  isRunning: Status
): boolean {
  switch (step) {
    case 0:
      return isUpdating || isRunning !== 'done';
    case 1:
    default:
      return false;
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
        item ? item.shortname : k,
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
