import { Button } from '@blueprintjs/core';
import React, { CSSProperties } from 'react';
import { EditorProcess } from '../../model/editormodel';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { EditAction } from '../../utils/constants';
import { EdtiorNodeWithInfoCallback, NodeCallBack } from '../flowui/container';
import {
  ActorDescription,
  DescriptionItem,
  EditButton,
  NonEmptyFieldDescription,
  ReferenceList,
  RemoveButton,
} from './selected';

export const ProcessQuickEdit: React.FC<
  NodeCallBack & {
    process: EditorProcess;
    setOldValue: (x: EdtiorNodeWithInfoCallback | null) => void;
    resetSelection: () => void;
  }
> = ({
  process,
  setOldValue,
  getProvisionById,
  getRefById,
  getRoleById,
  setDialog,
  resetSelection,
}) => {
  // const [editing, setEditing] = useState<ISimpleProcess | null>(null);

  // const roles:Array<string> = [''];
  // const refs:Array<string> = [''];
  // // if (editing !== null) {
  // //   mw.model.roles.map((r) => roles.push(r.id))
  // //   mw.model.refs.map((r) => refs.push(r.id))
  // // }

  // const startQuickEdit = () => {
  //   setEditing({
  //     id: process.id,
  //     name: process.name,
  //     modality: process.modality,
  //     actor: process.actor,
  //     provision: []
  //     // process.provision.flatMap((r) => {
  //     //   return { id: r.id, modality: r.modality, condition: r.condition, ref: r.ref.flatMap((ref) => { return ref.id }) }
  //     // })
  //   })
  //   setOldValue({...process, ...callback})
  // }

  // const saveEdit = () => {
  //   // if (save(sm, process, editing)) {
  //   //   setEditing(null)
  //   //   setOldValue(null)
  //   // }
  // }

  // const cancelEdit = () => {
  //   setEditing(null)
  //   setOldValue(null)
  // }

  // const setPID = (x:string) => {
  //   if (editing !== null) {
  //     editing.id = x.replaceAll(/\s+/g, '')
  //     setEditing({ ...editing })
  //   }
  // }

  // const setPName = (x:string) => {
  //   if (editing !== null) {
  //     editing.name = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const setPModality = (x:string) => {
  //   if (editing !== null) {
  //     editing.modality = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const setActor = (x:string) => {
  //   if (editing !== null) {
  //     editing.actor = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const setProvisioncondition = (x:string, index:number) => {
  //   if (editing !== null) {
  //     editing.provision[index].condition = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const setProvisionModality = (x:string, index:number) => {
  //   if (editing !== null) {
  //     editing.provision[index].modality = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const removeProvision = (index:number) => {
  //   if (editing !== null) {
  //     editing.provision.splice(index, 1)
  //     setEditing({ ...editing })
  //   }
  // }

  // const addProvision = () => {
  //   if (editing !== null) {
  //     editing.provision.push({
  //       modality: '',
  //       condition: '',
  //       ref: []
  //     })
  //     setEditing({ ...editing })
  //   }
  // }

  // const setProvisionReference = (x:string, pindex:number, rindex:number) => {
  //   if (editing !== null) {
  //     editing.provision[pindex].ref[rindex] = x
  //     setEditing({ ...editing })
  //   }
  // }

  // const removereference = (pindex:number, rindex:number) => {
  //   if (editing !== null) {
  //     editing.provision[pindex].ref.splice(rindex, 1)
  //     setEditing({ ...editing })
  //   }
  // }

  // const addReference = (pindex:number) => {
  //   if (editing != null) {
  //     editing.provision[pindex].ref.push('')
  //     setEditing({ ...editing })
  //   }
  // }

  // const genReferenceEdit = (ref:string, pindex:number, rindex:number) => {
  //   const elms:Array<JSX.Element> = []
  //   const dbutton = <button key={'ui#button#deletereference#' + pindex + '#' + rindex} onClick={() => removereference(pindex, rindex)}> Delete reference </button>
  //   // elms.push(<NormalComboBox key={'ui#provisionReference#' + pindex + '#' + rindex} text={'Reference ' + (rindex + 1) + ': '} value={ref} options = {refs} update={(y:string) => setProvisionReference(y, pindex, rindex)} extend={dbutton}/>)
  //   return <li key={'ui#ref#provision' + pindex + '#ref' + rindex}>{elms}</li>
  // }

  // const genProvisionEdit = (x:IProvision, index:number) => {
  //   const elms:Array<JSX.Element> = []
  //   const dbutton = <button key={'ui#button#deleteprovision#' + index} onClick={() => removeProvision(index)}> Delete provision </button>
  //   // elms.push(<NormalTextField key={'ui#provisionStatementLabel#' + index} text="Statement: " value={x.condition} update={(y:string) => setProvisioncondition(y, index)} extend={dbutton}/>)
  //   // elms.push(<NormalComboBox key={'ui#provisionModalityLabel#' + index} text="Modality: " value={x.modality} options = {MODAILITYOPTIONS} update={(y:string) => setProvisionModality(y, index)} />)
  //   elms.push(<p key={'ui#reflabel#' + index}>Reference: </p>)
  //   const ps:Array<JSX.Element> = []
  //   x.ref.forEach((r, rindex) => {
  //     ps.push(genReferenceEdit(r, index, rindex))
  //   })
  //   ps.push(<li key={'ui#li#provisionaddreference' + index}><button key={'ui#button#addreference#' + index} onClick={() => addReference(index)}> Add reference </button></li>)
  //   elms.push(<ul key={'ui#provisionRefs#' + index}>{ps}</ul>)
  //   return <>{elms}</>
  // }

  // useEffect(() => {
  //   const listener = (e:StorageEvent) => {
  //     console.debug('get something', e)
  //     if (editing !== null && e.key === 'addNewProvision' && e.newValue !== null) {
  //       let result = e.newValue
  //       let doc = ''
  //       let ns = ''
  //       let clause = ''
  //       let index = result.indexOf('\n')
  //       if (index >= 0) {
  //         doc = result.substr(0, index)
  //         result = result.substr(index + 1)
  //       }
  //       index = result.indexOf('\n')
  //       if (index >= 0) {
  //         ns = result.substr(0, index)
  //         result = result.substr(index + 1)
  //       }
  //       index = result.indexOf('\n')
  //       if (index >= 0) {
  //         clause = result.substr(0, index)
  //         result = result.substr(index + 1)
  //       }
  //       const provision:IProvision = {
  //         modality: '',
  //         condition: result,
  //         ref: []
  //       }
  //       if (clause !== '') {
  //         let found = false
  //         for (const r of mw.model.refs) {
  //           if (r.document === doc && r.clause === clause) {
  //             provision.ref.push(r.id)
  //             found = true
  //             break
  //           }
  //         }
  //         if (!found) {
  //           const rid = ns + 'ref' + clause.replaceAll('.', '-').trim()
  //           const ref = MMELFactory.createReference(rid)
  //           mw.idman.refs.set(rid, ref)
  //           ref.document = doc
  //           ref.clause = clause
  //           mw.model.refs.push(ref)
  //           mw.filterman.readDocu(mw.model.refs)
  //           provision.ref.push(rid)
  //         }
  //       }
  //       editing.provision.push(provision)
  //       setEditing({ ...editing })
  //     }
  //   }
  //   console.debug('append listener')
  //   window.addEventListener('storage', listener)
  //   return () => {
  //     console.debug('remove listener')
  //     window.removeEventListener('storage', listener)
  //   }
  // })

  // if (editing === null) {
  //   elms.push(<button key={'ui#button#viewprocess#' + process.id} onClick={() => {} /*functionCollection.viewEditProcess(process)*/}> Edit </button>)
  //   elms.push(<button key={'ui#button#removeprocess#' + process.id} onClick={() => {} /*Cleaner.removeProcess(process)*/}> Remove </button>)
  //   elms.push(<button key={'ui#button#quickeditprocess#' + process.id} onClick={() => startQuickEdit()}> Quick Edit </button>)
  //   if (process.page == null) {
  //     elms.push(<MyFloatButton key={'ui#addSubprocess#' + process.id} onClick={() => {} /*addSubprocess(process)*/}>+</MyFloatButton>)
  //   }
  //   elms.push(<p key={process.id + '#ProcessID'}> Process: {process.id} </p>)
  //   elms.push(<p key={process.id + '#ProcessName'}> Name: {process.name} </p>)
  //   // if (process.actor !== null) elms.push(<p key={process.id + '#ProcessActor'}> Actor: {process.actor.name} </p>)
  //   if (process.modality !== '') elms.push(<p key={process.id + '#Modality'}> Modality: {process.modality} </p>)
  //   // if (process.provision.length > 0) {
  //   //   const ps:Array<JSX.Element> = []
  //   //   process.provision.map((a:MMELProvision) => ps.push(<li key={process.id + '#Pro#' + a.id}> {describeProvision(a, isCLMode)} </li>))
  //   //   elms.push(<p key={process.id + '#Provisions'}>Provisions</p>)
  //   //   elms.push(<ul key={process.id + '#ProvisionList' }>{ps}</ul>)
  //   // }
  //   if (process.measure.length > 0) {
  //     const ms:Array<JSX.Element> = []
  //     process.measure.map((m:string, index:number) => ms.push(<li key={process.id + '#Measure#' + index}> {m} </li>))
  //     elms.push(<p key={process.id + '#MeasureText'}>Measurements</p>)
  //     elms.push(<ul key={process.id + '#MeasureList' }>{ms}</ul>)
  //   }
  // } else {
  //   // elms.push(<button key={'ui#button#quicksaveprocess#' + process.id} onClick={() => saveEdit()}> Save </button>)
  //   // elms.push(<button key={'ui#button#cancelsaveprocess#' + process.id} onClick={() => cancelEdit()}> Do not save </button>)

  //   // elms.push(<NormalTextField key="field#quickedit#processID" text="Process: " value={editing.id} update={setPID} />)
  //   // elms.push(<NormalTextField key="field#quickedit#processName" text="Name: " value={editing.name} update={setPName} />)
  //   // elms.push(<NormalComboBox key="field#quickedit#processActor" text="Actor: " value={editing.actor} options = {roles} update={setActor} />)
  //   // elms.push(<NormalComboBox key="field#quickedit#processModality" text="Modality: " value={editing.modality} options = {MODAILITYOPTIONS} update={setPModality} />)

  //   // elms.push(<p key={process.id + '#quickedit#Provisions'}>Provisions</p>)
  //   // const ps:Array<JSX.Element> = []
  //   // editing.provision.map((a:IProvision, index:number) => ps.push(<li key={process.id + '#Pro#' + index}> {genProvisionEdit(a, index)} </li>))
  //   // ps.push(<li key={process.id + '#AddPro'}> <button key="ui#button#addprovision" onClick={() => addProvision()}> Add provision </button> </li>)
  //   // elms.push(<ul key={process.id + '#ProvisionList' }>{ps}</ul>)
  // }
  return (
    <>
      <>
        <EditButton
          cid={process.id}
          callback={() =>
            setDialog(
              DataType.PROCESS,
              EditAction.EDIT,
              process.id,
              resetSelection
            )
          }
        />
        {process.page === '' && <AddPageButton callback={() => {}} />}
        <RemoveButton
          cid={process.id}
          callback={() =>
            setDialog(
              DataType.PROCESS,
              EditAction.DELETE,
              process.id,
              resetSelection
            )
          }
        />
      </>
      <DescriptionItem
        id={process.id + '#ProcessID'}
        label={'Process'}
        value={process.id}
      />
      <DescriptionItem
        id={process.id + '#ProcessName'}
        label={'Name'}
        value={process.name}
      />
      <ActorDescription
        role={getRoleById(process.actor)}
        id={process.id + '#ProcessActor'}
        label="Actor"
      />
      <NonEmptyFieldDescription
        id={process.id + '#Modality'}
        label="Modality"
        value={process.modality}
      />
      <ProvisionList
        pid={process.id}
        provisions={process.provision}
        getProvisionById={getProvisionById}
        getRefById={getRefById}
      />
    </>
  );
};

const ProvisionList: React.FC<{
  provisions: Set<string>;
  pid: string;
  getProvisionById: (id: string) => MMELProvision | null;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ provisions, pid, getProvisionById, getRefById }) {
  const pros: MMELProvision[] = [];
  provisions.forEach(r => {
    const ret = getProvisionById(r);
    if (ret !== null) {
      pros.push(ret);
    }
  });
  return (
    <>
      {provisions.size > 0 ? (
        <>
          <p key={pid + '#Provisions'}>Provisions</p>
          <ul key={pid + '#ProvisionList'}>
            {pros.map((provision: MMELProvision) => (
              <li key={pid + '#Pro#' + provision.id}>
                {' '}
                <DescribeProvision
                  provision={provision}
                  getRefById={getRefById}
                />{' '}
              </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

const DescribeProvision: React.FC<{
  provision: MMELProvision;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ provision, getRefById }) {
  const css: CSSProperties = {};
  if (provision.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  return (
    <>
      <DescriptionItem
        id={'ui#provisionStatementLabel#' + provision.id}
        label="Statement"
        css={css}
        value={provision.condition}
      />
      <NonEmptyFieldDescription
        id={'ui#provisionModalityLabel#' + provision.id}
        label="Modality"
        value={provision.modality}
      />
      <ReferenceList
        refs={provision.ref}
        pid={provision.id}
        getRefById={getRefById}
      />
    </>
  );
};

// function addSubprocess (x:MMELProcess) {
//   const sm = functionCollection.getStateMan()
//   const mw = sm.state.modelWrapper
//   const model = mw.model
//   const idreg = mw.idman
//   const pg = MMELFactory.createSubprocess(idreg.findUniquePageID('Page'))
//   const st = MMELFactory.createStartEvent(idreg.findUniqueID('Start'))
//   const nc = MMELFactory.createSubprocessComponent(st)
//   idreg.nodes.set(st.id, st)
//   pg.childs.push(nc)
//   const pgaddon = mw.subman.get(pg)
//   pgaddon.map.set(st.id, nc)
//   pgaddon.start = nc
//   model.events.push(st)
//   x.page = pg
//   model.pages.push(pg)
//   idreg.pages.set(pg.id, pg)
//   sm.setState({ ...sm.state })
// }

// function save (sm:StateMan, oldValue:MMELProcess|null, newValue:ISimpleProcess|null):boolean {
//   if (oldValue != null && newValue != null) {
//     const mw = sm.state.modelWrapper
//     const model = mw.model
//     const idreg = mw.idman
//     if (oldValue.id !== newValue.id) {
//       if (newValue.id === '') {
//         alert('ID is empty')
//         return false
//       }
//       if (idreg.nodes.has(newValue.id)) {
//         alert('New ID already exists')
//         return false
//       }
//       idreg.nodes.delete(oldValue.id)
//       idreg.nodes.set(newValue.id, oldValue)
//       functionCollection.renameLayoutItem(oldValue.id, newValue.id)
//       oldValue.id = newValue.id
//     }
//     oldValue.name = newValue.name
//     oldValue.modality = newValue.modality
//     if (newValue.actor === '') {
//       oldValue.actor = null
//     } else {
//       const actor = idreg.roles.get(newValue.actor)
//       if (actor?.datatype === DataType.ROLE) {
//         oldValue.actor = actor as MMELRole
//       } else {
//         console.error('Role not found: ', newValue.actor)
//       }
//     }
//     Cleaner.cleanProvisions(oldValue)
//     newValue.provision.forEach((p) => {
//       const id = idreg.findProvisionID('Provision')
//       const pro = MMELFactory.createProvision(id)
//       pro.condition = p.condition
//       pro.modality = p.modality
//       const refSet = new Set<string>()
//       p.ref.forEach((r) => {
//         if (r !== '' && !refSet.has(r)) {
//           refSet.add(r)
//           const ref = idreg.refs.get(r)
//           if (ref === undefined) {
//             console.error('Reference not found: ', r)
//           } else {
//             pro.ref.push(ref)
//           }
//         }
//       })
//       model.provisions.push(pro)
//       idreg.provisions.set(pro.id, pro)
//       oldValue.provision.push(pro)
//     })
//     sm.setState({ ...sm.state })
//   }
//   return true
// }

export const AddPageButton: React.FC<{
  callback: () => void;
}> = function ({ callback }) {
  return (
    <Button
      key="ui#button#addPageButton#"
      icon="map-create"
      text="Create subprocess"
      onClick={() => callback()}
    />
  );
};
