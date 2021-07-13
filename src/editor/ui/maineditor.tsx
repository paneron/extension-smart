/** @jsx jsx */

import { jsx } from '@emotion/react';
import React, { RefObject, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ControlButton,
  ReactFlowProvider,
  Connection,
  Edge,
  isNode,
} from 'react-flow-renderer';
import InfoPane from './component/infopane';
import ControlPane from './component/controlpane';
import { ModelWrapper } from './model/modelwrapper';
import { PageHistory } from './model/history';
import PathPane from './component/pathpane';
import { Registry } from '../model/model/data/registry';
import {
  edgeTypes,
  ISearch,
  IState,
  nodeTypes,
  SearchMan,
  StateMan,
} from './interface/state';
import NewComponentPane from './component/newcomponentpane';
import * as factory from '../model/util/componentFactory';
import BasicSettingPane from './component/basicsetting';
import FilterPane from './component/filterpane';
import {
  initProgressManager,
  recalculateEdgeHighlight,
  recalculateProgress,
} from './util/progressmanager';
import { functionCollection } from './util/function';
import { GraphNode } from '../model/model/graphnode';
import RepoEditPane from './component/edit/repoedit';
import { DocumentStore } from '../repository/document';
import OnePageChecklist from './component/onepagechecklist';
import { Process } from '../model/model/process/process';
import EditProcessPage from './component/processedit';
import { Approval } from '../model/model/process/approval';
import { EGate } from '../model/model/gate/egate';
import { SignalCatchEvent } from '../model/model/event/signalcatchevent';
import { Edge as MyEdge } from '../model/model/flow/edge';
import EditApprovalPage from './component/approvaledit';
import { TimerEvent } from '../model/model/event/timerevent';
import { EditSCEventPage, EditTimerPage } from './component/eventedit';
import { IEdgeLabel } from './interface/datainterface';
import { EditEGatePage } from './component/editEgate';
import {
  Subprocess,
  SubprocessComponent,
} from '../model/model/flow/subprocess';
import { NodeData } from './nodecontainer';
import { Dataclass } from '../model/model/data/dataclass';
import SimulationPage from './component/simulationpane';
import ImportPane from './component/importpane';
import AIPane from './component/aipane';
import MeasureCheckPane from './component/measurementcheckpane';
import LegendPane from './util/legendpane';
import styled from '@emotion/styled';

const initModel = factory.createNewModel();
const initModelWrapper = new ModelWrapper(initModel);

const canvusRef: RefObject<HTMLDivElement> = React.createRef();

const ModelEditor: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [state, setState] = useState<IState>({
    cvisible: false,
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: new PageHistory(null),
    rfInstance: null,
    nvisible: false,
    svisible: false,
    clvisible: false,
    fpvisible: false,
    aivisible: false,
    edgeDeleteVisible: false,
    importvisible: false,
    measureVisible: false,
    datarepo: null,
    datastore: new DocumentStore(),
    onepage: false,
    viewprocess: null,
    process: null,
    viewapproval: null,
    approval: null,
    viewTimer: null,
    timer: null,
    viewSignalEvent: null,
    scEvent: null,
    eGate: null,
    viewEGate: null,
    addingexisting: '',
    simulation: null,
    imodel: factory.createNewModel(),
    namespace: '',
    importing: '',
    mtestResult: null,
    mtestValues: new Map<string, string>(),
  });

  const [searchState, setSearchState] = useState<ISearch>({
    document: '',
    clause: '',
    actor: '',
  });

  const updateState = (s: IState): void => {
    setState(() => ({ ...s }));
  };

  const updateSearchState = (s: ISearch): void => {
    setSearchState(() => ({ ...s }));
  };

  const sm: StateMan = { state: state, setState: updateState };
  const searchman: SearchMan = {
    searchState: searchState,
    setSearchState: updateSearchState,
  };

  const onLoad = (params: OnLoadParams) => {
    console.log('flow loaded:', params);
    params.fitView();
    sm.state.rfInstance = params;
    updateState(sm.state);
  };

  console.debug(
    'Debug message: editor',
    state,
    searchState,
    state.modelWrapper.model.idreg
  );

  const checkUpdated = () => {
    const modelwrapper = state.modelWrapper;
    const root = modelwrapper.model.root;
    if (root != null) {
      recalculateProgress(root, modelwrapper);
    }
    updateState(state);
  };

  const addPageToHistory = (x: Subprocess, name: string) => {
    saveLayout();
    state.history.add(x, name);
    state.modelWrapper.page = x;
    updateState(state);
  };

  const saveLayout = () => {
    console.debug('Save Layout');
    if (state.rfInstance != null) {
      state.rfInstance.getElements().forEach(x => {
        const data = x.data;
        const page = sm.state.modelWrapper.page;
        const idreg = sm.state.modelWrapper.model.idreg;
        if (isNode(x) && data instanceof NodeData) {
          const gn = page.map.get(data.represent);
          if (gn != null) {
            gn.x = x.position.x;
            gn.y = x.position.y;
          } else {
            const obj = idreg.ids.get(data.represent);
            if (obj != undefined) {
              const nc = new SubprocessComponent(data.represent, '');
              if (obj instanceof Dataclass || obj instanceof Registry) {
                page.data.push(nc);
                nc.element = obj;
                nc.x = x.position.x;
                nc.y = x.position.y;
                page.map.set(data.represent, nc);
              } else if (obj instanceof GraphNode) {
                page.childs.push(nc);
                nc.element = obj;
                nc.x = x.position.x;
                nc.y = x.position.y;
                page.map.set(data.represent, nc);
              }
            }
          }
        }
      });
    }
  };

  const onDragOver = (event: React.DragEvent<any>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent<any>) => {
    event.preventDefault();
    if (canvusRef.current != null && state.rfInstance != null) {
      const reactFlowBounds = canvusRef.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/modeleditor');
      const pos = state.rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      factory.addComponent(
        type,
        state.modelWrapper.model,
        state.modelWrapper.page,
        pos
      );
      updateState(state);
    }
  };

  const getObjectByID = (id: string): GraphNode | undefined => {
    const idreg = sm.state.modelWrapper.model.idreg;
    if (idreg.ids.has(id)) {
      const ret = idreg.ids.get(id);
      if (ret instanceof GraphNode) {
        return ret;
      }
    }
    return undefined;
  };

  const removeLayoutItem = (id: string) => {
    state.modelWrapper.model.pages.forEach(p => {
      p.childs.forEach((c, index) => {
        if (c.element != null && c.element.id == id) {
          p.childs.splice(index, 1);
          p.map.delete(id);
        }
      });
      p.data.forEach((c, index) => {
        if (c.element != null && c.element.id == id) {
          p.data.splice(index, 1);
          p.map.delete(id);
        }
      });
    });
  };

  const renameLayoutItem = (old: string, name: string) => {
    saveLayout();
    state.modelWrapper.model.pages.forEach(p => {
      if (p.map.has(old)) {
        const y = p.map.get(old);
        if (y != null) {
          p.map.delete(old);
          p.map.set(name, y);
        }
      }
    });
  };

  const viewDataRepository = (x: Registry) => {
    state.datarepo = x;
    updateState(state);
  };

  const viewEditProcess = (p: Process) => {
    state.viewprocess = {
      id: p == null ? '' : p.id,
      name: p == null ? '' : p.name,
      modality: p == null ? '' : p.modality,
      actor: p == null || p.actor == null ? '' : p.actor.id,
      start: p != null && p.page != null,
      output:
        p == null
          ? []
          : p.output.flatMap(r => {
              return r.id;
            }),
      input:
        p == null
          ? []
          : p.input.flatMap(r => {
              return r.id;
            }),
      provision:
        p == null
          ? []
          : p.provision.flatMap(r => {
              return {
                id: r.id,
                modality: r.modality,
                condition: r.condition,
                ref: r.ref.flatMap(ref => {
                  return ref.id;
                }),
              };
            }),
      measure: [...p.measure],
    };
    state.process = p;
    updateState(state);
  };

  const viewEditApproval = (p: Approval) => {
    state.viewapproval = {
      id: p == null ? '' : p.id,
      name: p == null ? '' : p.name,
      modality: p == null ? '' : p.modality,
      actor: p == null || p.actor == null ? '' : p.actor.id,
      approver: p == null || p.approver == null ? '' : p.approver.id,
      records:
        p == null
          ? []
          : p.records.flatMap(r => {
              return r.id;
            }),
      ref:
        p == null
          ? []
          : p.ref.flatMap(r => {
              return r.id;
            }),
    };
    state.approval = p;
    updateState(state);
  };

  const viewEGate = (x: EGate) => {
    const edges: Array<IEdgeLabel> = [];
    sm.state.modelWrapper.page.edges.forEach(e => {
      if (e.from != null && e.from.element == x) {
        edges.push({
          id: e.id,
          description: e.description,
          condition: e.condition,
          target: e.to != null && e.to.element != null ? e.to.element.id : '',
        });
      }
    });
    state.viewEGate = {
      id: x == null ? '' : x.id,
      label: x == null ? '' : x.label,
      edges: edges,
    };
    state.eGate = x;
    updateState(state);
  };

  const viewSignalCatch = (x: SignalCatchEvent) => {
    state.viewSignalEvent = {
      id: x == null ? '' : x.id,
      signal: x == null ? '' : x.signal,
    };
    state.scEvent = x;
    updateState(state);
  };

  const viewTimer = (t: TimerEvent) => {
    state.viewTimer = {
      id: t == null ? '' : t.id,
      type: t == null ? '' : t.type,
      para: t == null ? '' : t.para,
    };
    state.timer = t;
    console.debug(state.viewTimer, state.timer);
    updateState(state);
  };

  const getStateMan = () => {
    return sm;
  };

  const connectHandle = (x: Edge<any> | Connection) => {
    if (!state.clvisible && x.source != null && x.target != null) {
      const mw = state.modelWrapper;
      const model = mw.model;
      const idreg = model.idreg;
      const page = mw.page;
      const s = page.map.get(x.source);
      const t = page.map.get(x.target);
      if (
        s != null &&
        t != null &&
        s instanceof SubprocessComponent &&
        t instanceof SubprocessComponent
      ) {
        if (
          s.element instanceof Dataclass ||
          s.element instanceof Registry ||
          t.element instanceof Dataclass ||
          t.element instanceof Registry
        ) {
          return;
        }
        const newEdge = new MyEdge(idreg.findUniqueEdgeID('Edge'), '');
        s.child.push(newEdge);
        newEdge.from = s;
        newEdge.to = t;
        mw.page.edges.push(newEdge);
        idreg.addEdge(newEdge.id, newEdge);
        updateState(state);
      }
    }
  };

  /* components */
  const csson: React.CSSProperties = {
    background: '#3d3',
  };

  const cssoff: React.CSSProperties = {};

  const controlPaneButton = (
    <ControlButton
      style={state.cvisible ? csson : cssoff}
      onClick={() => {
        state.cvisible = !state.cvisible;
        updateState(state);
      }}
    >
      Ctl
    </ControlButton>
  );

  const dataVisibleButton = (
    <ControlButton
      style={state.dvisible ? csson : cssoff}
      onClick={() => {
        state.dvisible = !state.dvisible;
        if (!state.dvisible) {
          saveLayout();
        }
        updateState(state);
      }}
    >
      Dat
    </ControlButton>
  );

  const newComponentButton = (
    <ControlButton
      style={state.nvisible ? csson : cssoff}
      onClick={() => {
        state.nvisible = !state.nvisible;
        updateState(state);
      }}
    >
      Add
    </ControlButton>
  );

  const basicSettingButton = (
    <ControlButton
      style={state.svisible ? csson : cssoff}
      onClick={() => {
        state.svisible = !state.svisible;
        updateState(state);
      }}
    >
      M
    </ControlButton>
  );

  const edgeDeleteButton = (
    <ControlButton
      style={state.edgeDeleteVisible ? csson : cssoff}
      onClick={() => {
        state.edgeDeleteVisible = !state.edgeDeleteVisible;
        updateState(state);
      }}
    >
      E
    </ControlButton>
  );

  const checkListButton = (
    <ControlButton
      style={state.clvisible ? csson : cssoff}
      onClick={() => {
        state.clvisible = !state.clvisible;
        if (state.clvisible) {
          state.cvisible = false;
          state.nvisible = false;
          state.svisible = false;
          state.fpvisible = false;
          state.aivisible = false;
          state.importvisible = false;
          state.edgeDeleteVisible = false;
          state.onepage = false;

          const model = sm.state.modelWrapper.model;
          if (model.root != null) {
            model.hps.map(p => {
              p.parent = [];
              p.job = null;
            });
            model.dcs.map(p => (p.parent = []));
            model.evs.map(p => (p.parent = []));
            model.gates.map(p => (p.parent = []));
            model.aps.map(p => (p.parent = []));
            initProgressManager();
          }
        } else {
          state.fpvisible = false;
          state.measureVisible = false;
          state.mtestResult = null;
        }
        updateState(state);
      }}
    >
      CL
    </ControlButton>
  );

  const measurePaneButton = (
    <ControlButton
      style={state.measureVisible ? csson : cssoff}
      onClick={() => {
        state.measureVisible = !state.measureVisible;
        if (!state.measureVisible) {
          state.mtestResult = null;
        }
        updateState(state);
      }}
    >
      Mea
    </ControlButton>
  );

  const filterPaneButton = (
    <ControlButton
      style={state.fpvisible ? csson : cssoff}
      onClick={() => {
        state.fpvisible = !state.fpvisible;
        updateState(state);
      }}
    >
      F
    </ControlButton>
  );

  const importButton = (
    <ControlButton
      style={state.importvisible ? csson : cssoff}
      onClick={() => {
        state.importvisible = !state.importvisible;
        updateState(state);
      }}
    >
      Imp
    </ControlButton>
  );

  const aiButton = (
    <ControlButton
      style={state.aivisible ? csson : cssoff}
      onClick={() => {
        state.aivisible = !state.aivisible;
        updateState(state);
      }}
    >
      AI
    </ControlButton>
  );

  /* rendering */

  if (state.clvisible) {
    if (state.modelWrapper.model.root != null) {
      recalculateEdgeHighlight(
        state.modelWrapper.page,
        state.modelWrapper.model
      );
    }
  }
  functionCollection.checkUpdated = checkUpdated;
  functionCollection.addPageToHistory = addPageToHistory;
  functionCollection.saveLayout = saveLayout;
  functionCollection.getObjectByID = getObjectByID;
  functionCollection.removeLayoutItem = removeLayoutItem;
  functionCollection.viewDataRepository = viewDataRepository;
  functionCollection.renameLayoutItem = renameLayoutItem;
  functionCollection.viewEditProcess = viewEditProcess;
  functionCollection.getStateMan = getStateMan;
  functionCollection.viewEditApproval = viewEditApproval;
  functionCollection.viewEGate = viewEGate;
  functionCollection.viewSignalCatch = viewSignalCatch;
  functionCollection.viewTimer = viewTimer;

  const elms: Array<JSX.Element> = [];
  if (state.svisible) {
    elms.push(<BasicSettingPane key="BasicSettingPage" {...sm} />);
  }
  if (state.nvisible) {
    elms.push(<NewComponentPane key="NewComponentPage" {...sm} />);
  }
  if (state.datarepo != null) {
    elms.push(<RepoEditPane key="DataRepoEditPage" {...sm} />);
  }
  if (state.fpvisible) {
    elms.push(<FilterPane key="FilteringPage" sm={sm} ssm={searchman} />);
  }
  if (state.onepage) {
    elms.push(
      <OnePageChecklist key="OnePageChecklistPage" sm={sm} cond={searchState} />
    );
  }
  if (state.viewprocess != null) {
    elms.push(<EditProcessPage key="EditProcessPage" {...sm} />);
  }
  if (state.viewapproval != null) {
    elms.push(<EditApprovalPage key="EditApprovalPage" {...sm} />);
  }
  if (state.viewTimer != null) {
    elms.push(<EditTimerPage key="BasicTimerPage" {...sm} />);
  }
  if (state.viewSignalEvent != null) {
    elms.push(<EditSCEventPage key="EditSCEventPage" {...sm} />);
  }
  if (state.viewEGate != null) {
    elms.push(<EditEGatePage key="EditEGatePage" {...sm} />);
  }
  if (!state.clvisible && state.simulation != null) {
    elms.push(<SimulationPage key="SimulationPage" {...sm} />);
  }
  if (state.importvisible) {
    elms.push(<ImportPane key="ImportComponentPage" {...sm} />);
  }
  if (state.aivisible) {
    elms.push(<AIPane key="AIPage" {...sm} />);
  }
  if (state.mtestResult != null || state.fpvisible) {
    elms.push(<LegendPane key="LegendPage" {...sm} />);
  }
  let ret: JSX.Element;
  if (isVisible) {
    ret = (
      <Container>
        <ReactFlowProvider>
          <ReactFlow
            key="MMELModel"
            elements={state.modelWrapper.getReactFlowElementsFrom(
              state.modelWrapper.page,
              state.dvisible,
              state.clvisible
            )}
            onConnect={connectHandle}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            snapToGrid={true}
            snapGrid={[10, 10]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesConnectable={!state.clvisible}
            ref={canvusRef}
          >
            <Controls>
              {dataVisibleButton}
              {state.simulation == null && !state.clvisible
                ? controlPaneButton
                : ''}
              {state.simulation == null && state.clvisible
                ? filterPaneButton
                : ''}
              {state.simulation == null && state.clvisible
                ? measurePaneButton
                : ''}
              {state.simulation == null ? checkListButton : ''}
              {state.simulation == null && !state.clvisible
                ? basicSettingButton
                : ''}
              {state.simulation == null && !state.clvisible
                ? newComponentButton
                : ''}
              {state.simulation == null && !state.clvisible
                ? edgeDeleteButton
                : ''}
              {state.simulation == null && !state.clvisible ? importButton : ''}
              {state.simulation == null && !state.clvisible ? aiButton : ''}
            </Controls>
          </ReactFlow>
          {state.simulation == null ? <PathPane {...sm} /> : ''}

          {state.measureVisible ? (
            <MeasureCheckPane />
          ) : (
            <InfoPane clvisible={state.clvisible} />
          )}

          <ControlPane key="ControlPanel" {...sm} />
          {elms}
        </ReactFlowProvider>
      </Container>
    );
  } else {
    ret = <div></div>;
  }
  return ret;
};

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 30%;
`;

export default ModelEditor;
