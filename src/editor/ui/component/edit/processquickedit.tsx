import styled from '@emotion/styled';
import React, { ChangeEvent, CSSProperties, useState } from 'react';
import { toSummary } from '../../../runtime/functions';
import { MODAILITYOPTIONS } from '../../../runtime/idManager';
import { MMELFactory } from '../../../runtime/modelComponentCreator';
import { DataType, MMELNode } from '../../../serialize/interface/baseinterface';
import { MMELProcess } from '../../../serialize/interface/processinterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../../serialize/interface/supportinterface';
import { IProvision, ISimpleProcess } from '../../interface/datainterface';
import { StateMan } from '../../interface/state';
import { Cleaner } from '../../util/cleaner';
import { functionCollection } from '../../util/function';
import { ProgressManager } from '../../util/progressmanager';
import NormalComboBox from '../unit/combobox';
import NormalTextField from '../unit/textfield';

export const ProcessQuickEdit: React.FC<{
  process: MMELProcess;
  isCLMode: boolean;
  setOldValue: (x: MMELNode | null) => void;
}> = ({ process, isCLMode, setOldValue }) => {
  const [editing, setEditing] = useState<ISimpleProcess | null>(null);
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;

  if (isCLMode && editing !== null) {
    setEditing(null);
  }

  const roles: Array<string> = [''];
  const refs: Array<string> = [''];
  if (editing !== null) {
    mw.model.roles.map(r => roles.push(r.id));
    mw.model.refs.map(r => refs.push(r.id));
  }

  const startQuickEdit = () => {
    setEditing({
      id: process.id,
      name: process.name,
      modality: process.modality,
      actor: process.actor === null ? '' : process.actor.id,
      provision: process.provision.flatMap(r => {
        return {
          id: r.id,
          modality: r.modality,
          condition: r.condition,
          ref: r.ref.flatMap(ref => {
            return ref.id;
          }),
        };
      }),
    });
    setOldValue(process);
  };

  const saveEdit = () => {
    save(sm, process, editing);
    setEditing(null);
    setOldValue(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setOldValue(null);
  };

  const setPID = (x: string) => {
    if (editing !== null) {
      editing.id = x.replaceAll(/\s+/g, '');
      setEditing({ ...editing });
    }
  };

  const setPName = (x: string) => {
    if (editing !== null) {
      editing.name = x;
      setEditing({ ...editing });
    }
  };

  const setPModality = (x: string) => {
    if (editing !== null) {
      editing.modality = x;
      setEditing({ ...editing });
    }
  };

  const setActor = (x: string) => {
    if (editing !== null) {
      editing.actor = x;
      setEditing({ ...editing });
    }
  };

  const setProvisioncondition = (x: string, index: number) => {
    if (editing !== null) {
      editing.provision[index].condition = x;
      setEditing({ ...editing });
    }
  };

  const setProvisionModality = (x: string, index: number) => {
    if (editing !== null) {
      editing.provision[index].modality = x;
      setEditing({ ...editing });
    }
  };

  const removeProvision = (index: number) => {
    if (editing !== null) {
      editing.provision.splice(index, 1);
      setEditing({ ...editing });
    }
  };

  const addProvision = () => {
    if (editing !== null) {
      editing.provision.push({
        modality: '',
        condition: '',
        ref: [],
      });
      setEditing({ ...editing });
    }
  };

  const setProvisionReference = (x: string, pindex: number, rindex: number) => {
    if (editing !== null) {
      editing.provision[pindex].ref[rindex] = x;
      setEditing({ ...editing });
    }
  };

  const removereference = (pindex: number, rindex: number) => {
    if (editing !== null) {
      editing.provision[pindex].ref.splice(rindex, 1);
      setEditing({ ...editing });
    }
  };

  const addReference = (pindex: number) => {
    if (editing !== null) {
      editing.provision[pindex].ref.push('');
      setEditing({ ...editing });
    }
  };

  const genReferenceEdit = (ref: string, pindex: number, rindex: number) => {
    const elms: Array<JSX.Element> = [];
    const dbutton = (
      <button
        key={'ui#button#deletereference#' + pindex + '#' + rindex}
        onClick={() => removereference(pindex, rindex)}
      >
        Delete reference
      </button>
    );
    elms.push(
      <NormalComboBox
        key={'ui#provisionReference#' + pindex + '#' + rindex}
        text={'Reference ' + (rindex + 1) + ': '}
        value={ref}
        options={refs}
        update={(y: string) => setProvisionReference(y, pindex, rindex)}
        extend={dbutton}
      />
    );
    return <li key={'ui#ref#provision' + pindex + '#ref' + rindex}>{elms}</li>;
  };

  const genProvisionEdit = (x: IProvision, index: number) => {
    const elms: Array<JSX.Element> = [];
    const dbutton = (
      <button
        key={'ui#button#deleteprovision#' + index}
        onClick={() => removeProvision(index)}
      >
        Delete provision
      </button>
    );
    elms.push(
      <NormalTextField
        key={'ui#provisionStatementLabel#' + index}
        text="Statement: "
        value={x.condition}
        update={(y: string) => setProvisioncondition(y, index)}
        extend={dbutton}
      />
    );
    elms.push(
      <NormalComboBox
        key={'ui#provisionModalityLabel#' + index}
        text="Modality: "
        value={x.modality}
        options={MODAILITYOPTIONS}
        update={(y: string) => setProvisionModality(y, index)}
      />
    );
    elms.push(<p key={'ui#reflabel#' + index}>Reference: </p>);
    const ps: Array<JSX.Element> = [];
    x.ref.forEach((r, rindex) => {
      ps.push(genReferenceEdit(r, index, rindex));
    });
    ps.push(
      <li key={'ui#li#provisionaddreference' + index}>
        <button
          key={'ui#button#addreference#' + index}
          onClick={() => addReference(index)}
        >
          {' '}
          Add reference{' '}
        </button>
      </li>
    );
    elms.push(<ul key={'ui#provisionRefs#' + index}>{ps}</ul>);
    return <>{elms}</>;
  };
  const elms: Array<JSX.Element> = [];
  if (editing === null) {
    if (!isCLMode) {
      elms.push(
        <button
          key={'ui#button#viewprocess#' + process.id}
          onClick={() => functionCollection.viewEditProcess(process)}
        >
          {' '}
          Edit{' '}
        </button>
      );
      elms.push(
        <button
          key={'ui#button#removeprocess#' + process.id}
          onClick={() => Cleaner.removeProcess(process)}
        >
          {' '}
          Remove{' '}
        </button>
      );
      elms.push(
        <button
          key={'ui#button#quickeditprocess#' + process.id}
          onClick={() => startQuickEdit()}
        >
          {' '}
          Quick Edit{' '}
        </button>
      );
      if (process.page === null) {
        elms.push(
          <MyFloatButton
            key={'ui#addSubprocess#' + process.id}
            onClick={() => addSubprocess(process)}
          >
            +
          </MyFloatButton>
        );
      }
    }
    elms.push(<p key={process.id + '#ProcessID'}> Process: {process.id} </p>);
    elms.push(<p key={process.id + '#ProcessName'}> Name: {process.name} </p>);
    if (process.actor !== null) {
      elms.push(
        <p key={process.id + '#ProcessActor'}> Actor: {process.actor.name} </p>
      );
    }
    if (process.modality !== '') {
      elms.push(
        <p key={process.id + '#Modality'}> Modality: {process.modality} </p>
      );
    }
    if (process.provision.length > 0) {
      const ps: Array<JSX.Element> = [];
      process.provision.map((a: MMELProvision) =>
        ps.push(
          <li key={process.id + '#Pro#' + a.id}>
            {' '}
            {describeProvision(a, isCLMode)}{' '}
          </li>
        )
      );
      elms.push(<p key={process.id + '#Provisions'}>Provisions</p>);
      elms.push(<ul key={process.id + '#ProvisionList'}>{ps}</ul>);
    }
    if (process.measure.length > 0) {
      const ms: Array<JSX.Element> = [];
      process.measure.map((m: string, index: number) =>
        ms.push(<li key={process.id + '#Measure#' + index}> {m} </li>)
      );
      elms.push(<p key={process.id + '#MeasureText'}>Measurements</p>);
      elms.push(<ul key={process.id + '#MeasureList'}>{ms}</ul>);
    }
  } else {
    elms.push(
      <button
        key={'ui#button#quicksaveprocess#' + process.id}
        onClick={() => saveEdit()}
      >
        {' '}
        Save{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#cancelsaveprocess#' + process.id}
        onClick={() => cancelEdit()}
      >
        {' '}
        Do not save{' '}
      </button>
    );

    elms.push(
      <NormalTextField
        key="field#quickedit#processID"
        text="Process: "
        value={editing.id}
        update={setPID}
      />
    );
    elms.push(
      <NormalTextField
        key="field#quickedit#processName"
        text="Name: "
        value={editing.name}
        update={setPName}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#quickedit#processActor"
        text="Actor: "
        value={editing.actor}
        options={roles}
        update={setActor}
      />
    );
    elms.push(
      <NormalComboBox
        key="field#quickedit#processModality"
        text="Modality: "
        value={editing.modality}
        options={MODAILITYOPTIONS}
        update={setPModality}
      />
    );

    elms.push(<p key={process.id + '#quickedit#Provisions'}>Provisions</p>);
    const ps: Array<JSX.Element> = [];
    editing.provision.map((a: IProvision, index: number) =>
      ps.push(
        <li key={process.id + '#Pro#' + index}>
          {' '}
          {genProvisionEdit(a, index)}{' '}
        </li>
      )
    );
    ps.push(
      <li key={process.id + '#AddPro'}>
        {' '}
        <button key="ui#button#addprovision" onClick={() => addProvision()}>
          {' '}
          Add provision{' '}
        </button>{' '}
      </li>
    );
    elms.push(<ul key={process.id + '#ProvisionList'}>{ps}</ul>);
  }
  return <>{elms} </>;
};

function describeProvision(
  x: MMELProvision,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.items.get(x);
    if (addon !== undefined) {
      elms.push(
        <p key={'ui#provisionStatementLabel#' + x.id}>
          <input
            type="checkbox"
            id={x.id + '#CheckBox'}
            checked={addon.isChecked}
            onChange={e => {
              ProgressManager.setProvisionChecked(x);
              functionCollection.checkUpdated();
            }}
          />
          Statement: <span style={css}> {x.condition}</span>
        </p>
      );
    }
  } else {
    elms.push(
      <p key={'ui#provisionStatementLabel#' + x.id}>
        {' '}
        Statement: <span style={css}> {x.condition}</span>
      </p>
    );
  }
  if (x.modality !== '') {
    elms.push(
      <p key={'ui#provisionModalityLabel#' + x.id}>Modality: {x.modality}</p>
    );
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id + '#ref#' + x.id}>{toSummary(a)} </li>)
    );
    elms.push(<p key={'ui#reflabel#' + x.id}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  if (isCheckListMode) {
    elms.push(
      <p key={x.id + '#ProgressLabel'}>
        Progress:{' '}
        <input
          type="number"
          min="0"
          max="100"
          value={
            functionCollection
              .getStateMan()
              .state.modelWrapper.clman.items.get(x)?.progress
          }
          onChange={e => progressUpdate(e, x)}
        ></input>
        %{' '}
      </p>
    );
  }
  return <>{elms}</>;
}

function addSubprocess(x: MMELProcess) {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  const pg = MMELFactory.createSubprocess(idreg.findUniquePageID('Page'));
  const st = MMELFactory.createStartEvent(idreg.findUniqueID('Start'));
  const nc = MMELFactory.createSubprocessComponent(st);
  idreg.nodes.set(st.id, st);
  pg.childs.push(nc);
  const pgaddon = mw.subman.get(pg);
  pgaddon.map.set(st.id, nc);
  pgaddon.start = nc;
  model.events.push(st);
  x.page = pg;
  model.pages.push(pg);
  idreg.pages.set(pg.id, pg);
  sm.setState({ ...sm.state });
}

function progressUpdate(e: ChangeEvent<HTMLInputElement>, x: MMELProvision) {
  const subject = e.target.value;
  let parsed = parseInt(subject);
  if (isNaN(parsed)) {
    e.target.value = '0';
    parsed = 0;
  }
  if (parsed > 100) {
    parsed = 100;
    e.target.value = '100';
  }
  if (parsed < 0) {
    parsed = 0;
    e.target.value = '0';
  }
  ProgressManager.setProvisionProgress(x, parsed);
  functionCollection.checkUpdated();
}

function save(
  sm: StateMan,
  oldValue: MMELProcess | null,
  newValue: ISimpleProcess | null
) {
  if (oldValue !== null && newValue !== null) {
    const mw = sm.state.modelWrapper;
    const model = mw.model;
    const idreg = mw.idman;
    if (oldValue.id !== newValue.id) {
      if (newValue.id === '') {
        alert('ID is empty');
        return;
      }
      if (idreg.nodes.has(newValue.id)) {
        alert('New ID already exists');
        return;
      }
      idreg.nodes.delete(oldValue.id);
      idreg.nodes.set(newValue.id, oldValue);
      functionCollection.renameLayoutItem(oldValue.id, newValue.id);
      oldValue.id = newValue.id;
    }
    oldValue.name = newValue.name;
    oldValue.modality = newValue.modality;
    if (newValue.actor === '') {
      oldValue.actor = null;
    } else {
      const actor = idreg.roles.get(newValue.actor);
      if (actor?.datatype === DataType.ROLE) {
        oldValue.actor = actor as MMELRole;
      } else {
        console.error('Role not found: ', newValue.actor);
      }
    }
    Cleaner.cleanProvisions(oldValue);
    newValue.provision.map(p => {
      const id = idreg.findProvisionID('Provision');
      const pro = MMELFactory.createProvision(id);
      pro.condition = p.condition;
      pro.modality = p.modality;
      p.ref.map(r => {
        if (r !== '') {
          const ref = idreg.refs.get(r);
          if (ref === undefined) {
            console.error('Reference not found: ', r);
          } else {
            pro.ref.push(ref);
          }
        }
      });
      model.provisions.push(pro);
      idreg.provisions.set(pro.id, pro);
      oldValue.provision.push(pro);
    });
  }
}

// const ProgressLabel: React.FC<{
//   provision: MMELProvision;
// }> = function ({ provision }): JSX.Element {
//   return (
//     <p key={provision.id + '#ProgressLabel'}>
//       Progress:{' '}
//       <input
//         type="number"
//         min="0"
//         max="100"
//         value={
//           functionCollection
//             .getStateMan()
//             .state.modelWrapper.clman.getItemAddOn(provision).progress
//         }
//         onChange={e => progressUpdate(e, provision)}
//       ></input>
//       %{' '}
//     </p>
//   );
// };

// const DescribeProvision: React.FC<{
//   provision: MMELProvision;
//   isCheckListMode: boolean;
// }> = function ({ provision, isCheckListMode }) {
//   const css: CSSProperties = {};
//   const mw = functionCollection.getStateMan().state.modelWrapper;
//   const addon = mw.clman.getItemAddOn(provision);
//   if (provision.modality === 'SHALL') {
//     css.textDecorationLine = 'underline';
//   }
//   return (
//     <>
//       {isCheckListMode ? (
//         <CheckBoxProgressField
//           fieldkey={'ui#provisionStatementLabel#' + provision.id}
//           checkboxkey={provision.id + '#CheckBox'}
//           value={addon.isChecked}
//           css={css}
//           label="Statement"
//           statement={provision.condition}
//           callback={() => {
//             ProgressManager.setProvisionChecked(provision);
//             functionCollection.checkUpdated();
//           }}
//         />
//       ) : (
//         <DescriptionItem
//           id={'ui#provisionStatementLabel#' + provision.id}
//           label="Statement"
//           css={css}
//           value={provision.condition}
//         />
//       )}
//       <NonEmptyFieldDescription
//         id={'ui#provisionModalityLabel#' + provision.id}
//         label="Modality"
//         value={provision.modality}
//       />
//       <ReferenceList refs={provision.ref} pid={provision.id} />
//       {isCheckListMode ? <ProgressLabel provision={provision} /> : ''}
//     </>
//   );
// };

// return (
//   <>
//     {!isCheckListMode && (
//       <>
//         <EditButton
//           cid={process.id}
//           callback={() => functionCollection.viewEditProcess(process)}
//         />
//         <RemoveButton
//           cid={process.id}
//           callback={() => Cleaner.removeProcess(process)}
//         />
//         {process.page === null && (
//           <MyFloatButton onClick={() => addSubprocess(process)}>
//             +
//           </MyFloatButton>
//         )}
//       </>
//     )}
//     <DescriptionItem
//       id={process.id + '#ProcessID'}
//       label={'Process'}
//       value={process.id}
//     />
//     <DescriptionItem
//       id={process.id + '#ProcessName'}
//       label={'Name'}
//       value={process.name}
//     />
//     <ActorDescription
//       role={process.actor}
//       id={process.id + '#ProcessActor'}
//       label="Actor"
//     />
//     <NonEmptyFieldDescription
//       id={process.id + '#Modality'}
//       label="Modality"
//       value={process.modality}
//     />
//     <ProvisionList
//       pid={process.id}
//       provisions={process.provision}
//       isCheckListMode={isCheckListMode}
//     />
//     <MeasurementList pid={process.id} measurement={process.measure} />
//   </>
// );

// const ProvisionList: React.FC<{
//   provisions: MMELProvision[];
//   pid: string;
//   isCheckListMode: boolean;
// }> = function ({ provisions, pid, isCheckListMode }) {
//   return (
//     <>
//       {provisions.length > 0 ? (
//         <>
//           <p key={pid + '#Provisions'}>Provisions</p>
//           <ul key={pid + '#ProvisionList'}>
//             {provisions.map((provision: MMELProvision) => (
//               <li key={pid + '#Pro#' + provision.id}>
//                 {' '}
//                 <DescribeProvision
//                   provision={provision}
//                   isCheckListMode={isCheckListMode}
//                 />{' '}
//               </li>
//             ))}
//           </ul>
//         </>
//       ) : (
//         ''
//       )}
//     </>
//   );
// };

// const MeasurementList: React.FC<{
//   measurement: string[];
//   pid: string;
// }> = function ({ measurement, pid }) {
//   return (
//     <>
//       {measurement.length > 0 ? (
//         <>
//           <p key={pid + '#MeasureText'}>Measurements</p>
//           <ul key={pid + '#MeasureList'}>
//             {measurement.map((m: string, index: number) => (
//               <li key={pid + '#Measure#' + index}> {m} </li>
//             ))}
//           </ul>
//         </>
//       ) : (
//         ''
//       )}
//     </>
//   );
// };

const MyFloatButton = styled.button`
  position: absolute;
  right: 5%;
  top: 2%;
  font-size: 30px;
  box-shadow: inset 0px 1px 0px 0px #fff6af;
  background: linear-gradient(to bottom, #ffec64 5%, #ffab23 100%);
  background-color: #ffec64;
  border-radius: 6px;
  border: 1px solid #ffaa22;
  display: inline-block;
  cursor: pointer;
  color: #333333;
  font-family: Arial;
  font-weight: bold;
  padding: 6px 24px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffee66;
`;
