import { FormGroup } from '@blueprintjs/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import {
  EditorModel,
  EditorProcess,
  EditorRegistry,
} from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELLink,
  MMELNote,
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import {
  checkId,
  getModelAllRegs,
  getModelAllRoles,
  removeSpace,
} from '../../utils/ModelFunctions';
import { createNote, createProvision } from '../../utils/EditorFactory';
import {
  MultiReferenceSelector,
  NormalTextField,
  ReferenceSelector,
} from '../common/fields';
import ListWithPopoverItem from '../common/listmanagement/listPopoverItem';
import { EditPageButtons } from './commons';
import {
  IMeasure,
  matchMeasurementFilter,
  MeasurementItem,
} from './measurementExpressionEdit';
import { matchProvisionFilter, ProvisonItem } from './provisionedit';
import RoleSelector from './components/RoleSelector';
import { DescriptionItem } from '../common/description/fields';
import RegistrySelector from './components/RegistrySelector';
import ProvisionListQuickEdit from './components/ProvisionList';
import MeasureListQuickEdit from './components/MeasurementListEdit';
import { RefTextSelection } from '../../model/selectionImport';
import { matchNoteFilter, NoteItem } from './NoteEdit';
import NoteListQuickEdit from './components/NoteList';
import { LinkItem, matchLinkFilter } from './LinkEdit';
import { ModelAction } from '../../model/editor/model';
import PopoverChangeIDButton from '../popover/PopoverChangeIDButton';
import { editProcessCommand } from '../../model/editor/commands/elements';

function getInitProvisions(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELProvision> {
  const initProvision: Record<string, MMELProvision> = {};
  for (const p of process.provision) {
    if (model.provisions[p]) {
      initProvision[p] = model.provisions[p];
    }
  }
  return initProvision;
}

function getInitNotes(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELNote> {
  const initNotes: Record<string, MMELNote> = {};
  for (const n of process.notes) {
    if (model.notes[n]) {
      initNotes[n] = model.notes[n];
    }
  }
  return initNotes;
}

function getInitLinks(
  model: EditorModel,
  process: EditorProcess
): Record<string, MMELLink> {
  const initLinks: Record<string, MMELLink> = {};
  for (const n of process.links) {
    if (model.links[n]) {
      initLinks[n] = model.links[n];
    }
  }
  return initLinks;
}

const emptyMeasurement: IMeasure = {
  id: '',
  datatype: DataType.VARIABLE,
  measure: '',
};

const emptyLink: MMELLink = {
  id: '',
  title: '',
  description: '',
  link: '',
  type: 'REPO',
  datatype: DataType.LINK,
};

interface CommonProcessEditProps {
  onUpdateClick: () => void;
  editing: EditorProcess;
  setEditing: (x: EditorProcess) => void;
  provisions: Record<string, MMELProvision>;
  setProvisions: (x: Record<string, MMELProvision>) => void;
  model: EditorModel;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  notes: Record<string, MMELNote>;
  setNotes: (x: Record<string, MMELNote>) => void;
  setMeasurements: (x: string[]) => void;
}

const EditProcessPage: React.FC<{
  model: EditorModel;
  act: (x: ModelAction) => void;
  process: EditorProcess;
  closeDialog?: () => void;
  minimal?: boolean;
  onFullEditClick?: () => void;
  onDeleteClick?: () => void;
  onBringoutClick?: () => void;
  onSubprocessClick?: () => void;
  onSubprocessRemoveClick?: () => void;
  provision?: RefTextSelection;
  setSelectedNode?: (id: string) => void;
}> = function ({
  model,
  act,
  process,
  closeDialog,
  minimal = false,
  onFullEditClick,
  onDeleteClick,
  onSubprocessClick,
  onSubprocessRemoveClick,
  onBringoutClick,
  provision,
  setSelectedNode,
}) {
  const [editing, setEditing] = useState<EditorProcess>({ ...process });
  const [provisions, setProvisions] = useState<Record<string, MMELProvision>>(
    getInitProvisions(model, process)
  );
  const [notes, setNotes] = useState<Record<string, MMELNote>>(
    getInitNotes(model, process)
  );
  const [links, setLinks] = useState<Record<string, MMELLink>>(
    getInitLinks(model, process)
  );
  const [hasChange, setHasChange] = useState<boolean>(false);

  const roleObjects = useMemo(() => getModelAllRoles(model), [model]);
  const roles = useMemo(
    () => ['', ...roleObjects.map(r => r.id)],
    [roleObjects]
  );
  const registryObjects = useMemo(() => getModelAllRegs(model), [model]);
  const regs = useMemo(() => registryObjects.map(r => r.id), [registryObjects]);
  const tables = useMemo(
    () => Object.values(model.tables).map(t => t.id),
    [model.tables]
  );
  const figures = useMemo(
    () => Object.values(model.figures).map(t => t.id),
    [model.figures]
  );
  const modelRef = useRef<EditorModel>();
  modelRef.current = model;

  function onUpdateClick() {
    const action = editProcessCommand(
      process.id,
      editing,
      Object.values(provisions),
      Object.values(notes),
      Object.values(links),
      []
    );
    act(action);
    if (closeDialog) {
      closeDialog();
    }
    setHasChange(false);
    if (setSelectedNode !== undefined && process.id !== editing.id) {
      setSelectedNode(editing.id);
    }
  }

  function onAddReference(refs: MMELReference[]) {
    saveOnExit(refs);
  }

  function setEdit(x: EditorProcess) {
    setEditing(x);
    onChange();
  }

  function setPros(x: Record<string, MMELProvision>) {
    setProvisions(x);
    onChange();
  }

  function setMeasurements(x: string[]) {
    setEditing({ ...editing, measure: x });
  }

  function setN(x: Record<string, MMELNote>) {
    setNotes(x);
    onChange();
  }

  function onChange() {
    if (!hasChange) {
      setHasChange(true);
    }
  }

  function saveOnExit(refs?: MMELReference[]) {
    setHasChange(hc => {
      if (hc) {
        setEditing(edit => {
          setLinks(ls => {
            setProvisions(pros => {
              setNotes(nos => {
                const action = editProcessCommand(
                  process.id,
                  edit,
                  Object.values(pros),
                  Object.values(nos),
                  Object.values(ls),
                  refs ?? []
                );
                act(action);
                return nos;
              });
              return pros;
            });
            return ls;
          });
          return edit;
        });
      }
      return false;
    });
  }

  function onNewID(id: string) {
    const action = editProcessCommand(
      process.id,
      { ...editing, id },
      Object.values(provisions),
      Object.values(notes),
      Object.values(links),
      []
    );
    act(action);
    setHasChange(false);
    if (setSelectedNode !== undefined) {
      setSelectedNode(id);
    }
  }

  const fullEditClick =
    onFullEditClick !== undefined
      ? function () {
          if (hasChange) {
            onUpdateClick();
          }
          onFullEditClick();
        }
      : undefined;

  const commonProps = {
    onUpdateClick,
    editing,
    setEditing: setEdit,
    provisions,
    setProvisions: setPros,
    notes,
    setNotes: setN,
    model,
    onFullEditClick: fullEditClick,
    onDeleteClick,
    setMeasurements,
  };

  const fullEditProps = {
    closeDialog,
    roles,
    regs,
    tables,
    figures,
    links,
    setLinks,
  };

  const quickEditProps = {
    roleObjects,
    registryObjects,
    process,
    saveOnExit,
    provision,
    onAddReference,
    initID: process.id,
    onSubprocessClick,
    onSubprocessRemoveClick,
    onBringoutClick,
    validTest: (id: string) => id === process.id || checkId(id, model.elements),
    onNewID,
  };

  useEffect(() => {
    setEditing(process);
    setProvisions(getInitProvisions(model, process));
    setNotes(getInitNotes(model, process));
    setLinks(getInitLinks(model, process));
  }, [model, process]);

  return minimal ? (
    <QuickVersionEdit {...commonProps} {...quickEditProps} />
  ) : (
    <FullVersionEdit {...commonProps} {...fullEditProps} />
  );
};

const QuickVersionEdit: React.FC<
  CommonProcessEditProps & {
    roleObjects: MMELRole[];
    registryObjects: EditorRegistry[];
    process: EditorProcess;
    saveOnExit: () => void;
    provision?: RefTextSelection;
    onAddReference: (refs: MMELReference[]) => void;
    onNewID: (id: string) => void;
    onSubprocessClick?: () => void;
    onSubprocessRemoveClick?: () => void;
    onBringoutClick?: () => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    provisions,
    setProvisions,
    model,
    roleObjects,
    registryObjects,
    process,
    saveOnExit,
    provision,
    onAddReference,
    notes,
    setNotes,
    onNewID,
    setMeasurements,
  } = props;

  useEffect(() => saveOnExit, [model, process]);

  function idTest(id: string) {
    return id === process.id || checkId(id, model.elements);
  }

  const idButton = (
    <PopoverChangeIDButton
      initValue={editing.id}
      validTest={idTest}
      save={onNewID}
    />
  );

  return (
    <FormGroup>
      <EditPageButtons {...props} />
      <DescriptionItem
        label="Process ID"
        value={editing.id}
        extend={idButton}
      />
      <NormalTextField
        text="Process Name"
        value={editing.name}
        onChange={x => setEditing({ ...editing, name: x })}
      />
      <RoleSelector
        label="Actor"
        activeItem={editing.actor !== '' ? model.roles[editing.actor] : null}
        items={roleObjects}
        onItemSelect={x =>
          setEditing({ ...editing, actor: x !== null ? x.id : '' })
        }
      />
      <RegistrySelector
        label="Input data registry"
        selected={editing.input}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({ ...editing, input: new Set([...editing.input, x.id]) })
        }
        onTagRemove={x => {
          editing.input = new Set([...editing.input].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
      <RegistrySelector
        label="Output data registry"
        selected={editing.output}
        items={registryObjects}
        onItemSelect={x =>
          setEditing({ ...editing, output: new Set([...editing.output, x.id]) })
        }
        onTagRemove={x => {
          editing.output = new Set([...editing.output].filter(s => x !== s));
          setEditing({ ...editing });
        }}
      />
      <ProvisionListQuickEdit
        provisions={provisions}
        setProvisions={setProvisions}
        selected={provision}
        model={model}
        onAddReference={onAddReference}
      />
      <NoteListQuickEdit
        notes={notes}
        setNotes={setNotes}
        selected={provision}
        model={model}
        onAddReference={onAddReference}
      />
      <MeasureListQuickEdit
        measurements={editing.measure}
        setMeasurements={setMeasurements}
      />
    </FormGroup>
  );
};

const FullVersionEdit: React.FC<
  CommonProcessEditProps & {
    closeDialog?: () => void;
    roles: string[];
    regs: string[];
    tables: string[];
    figures: string[];
    links: Record<string, MMELLink>;
    setLinks: (x: Record<string, MMELLink>) => void;
  }
> = function (props) {
  const {
    editing,
    setEditing,
    provisions,
    setProvisions,
    model,
    roles,
    regs,
    tables,
    figures,
    notes,
    setNotes,
    links,
    setLinks,
    setMeasurements,
  } = props;
  const measures: Record<string, IMeasure> = editing.measure.reduce(
    (obj, x, index) => ({
      ...obj,
      [index]: { id: index.toString(), measure: x },
    }),
    {}
  );
  return (
    <MGDDisplayPane>
      <FormGroup>
        <EditPageButtons {...props} />
        <NormalTextField
          text="Process ID"
          value={editing.id}
          onChange={x => setEditing({ ...editing, id: removeSpace(x) })}
        />
        <NormalTextField
          text="Process Name"
          value={editing.name}
          onChange={x => setEditing({ ...editing, name: x })}
        />
        <ReferenceSelector
          text="Actor"
          filterName="Actor filter"
          value={editing.actor}
          options={roles}
          update={x => setEditing({ ...editing, actor: roles[x] })}
        />
        <MultiReferenceSelector
          text="Input data registry"
          options={regs}
          values={editing.input}
          filterName="Input Registry filter"
          add={x => {
            editing.input = new Set([...editing.input, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.input = new Set([...editing.input].filter(s => !x.has(s)));
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Output data registry"
          options={regs}
          values={editing.output}
          filterName="Output Registry filter"
          add={x => {
            editing.output = new Set([...editing.output, ...x]);
            setEditing({ ...editing });
          }}
          remove={x => {
            editing.output = new Set(
              [...editing.output].filter(s => !x.has(s))
            );
            setEditing({ ...editing });
          }}
        />
        <MultiReferenceSelector
          text="Reference tables"
          options={tables}
          values={editing.tables}
          filterName="Table filter"
          add={x => {
            const newTables = new Set([...editing.tables, ...x]);
            setEditing({ ...editing, tables: newTables });
          }}
          remove={x => {
            const newTables = new Set(
              [...editing.tables].filter(s => !x.has(s))
            );
            setEditing({ ...editing, tables: newTables });
          }}
        />
        <MultiReferenceSelector
          text="Reference multimedia"
          options={figures}
          values={editing.figures}
          filterName="Multimedia filter"
          add={x =>
            setEditing({
              ...editing,
              figures: new Set([...editing.figures, ...x]),
            })
          }
          remove={x => {
            const newFig = new Set([...editing.figures].filter(s => !x.has(s)));
            setEditing({ ...editing, figures: newFig });
          }}
        />
        <ListWithPopoverItem
          items={{ ...provisions }}
          setItems={x => setProvisions(x as Record<string, MMELProvision>)}
          model={model}
          initObject={createProvision('')}
          matchFilter={matchProvisionFilter}
          getListItem={x => {
            const pro = x as MMELProvision;
            return {
              id: x.id,
              text: `${pro.modality}: ${pro.condition}`,
            };
          }}
          filterName="Provision filter"
          Content={ProvisonItem}
          label="Provisions"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={{ ...notes }}
          setItems={x => setNotes(x as Record<string, MMELNote>)}
          model={model}
          initObject={createNote('')}
          matchFilter={matchNoteFilter}
          getListItem={x => {
            const note = x as MMELNote;
            return {
              id: note.id,
              text: note.message,
            };
          }}
          filterName="Note filter"
          Content={NoteItem}
          label="Notes"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={measures}
          setItems={x => setMeasurements(Object.values(x).map(y => y.measure))}
          model={model}
          initObject={{ ...emptyMeasurement }}
          matchFilter={matchMeasurementFilter}
          getListItem={x => ({
            id: x.id,
            text: x.measure,
          })}
          filterName="Measurement filter"
          Content={MeasurementItem}
          label="Measurement tests"
          size={7}
          requireUniqueId={false}
        />
        <ListWithPopoverItem
          items={{ ...links }}
          setItems={x => setLinks(x as Record<string, MMELLink>)}
          model={model}
          initObject={{ ...emptyLink }}
          matchFilter={matchLinkFilter}
          getListItem={x => ({ id: x.id, text: x.title })}
          filterName="Link filter"
          Content={LinkItem}
          label="External links"
          size={7}
          requireUniqueId={false}
        />
      </FormGroup>
    </MGDDisplayPane>
  );
};

export default EditProcessPage;
