import { InputGroup, IToaster, IToastProps, Toaster } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { useContext, useMemo, useState } from 'react';
import { ModelWrapper } from '../../model/modelwrapper';
import {
  MMELRepo,
  RepoIndex,
  repoIndexPath,
  RepoItems,
  RepoItemType,
} from '../../model/repo';
import {
  COMMITMSG,
  getPathByNS,
  MMELToSerializable,
  RepoFileType,
} from '../../utils/repo/io';
import RepoInfoPane from './RepoInfoPane';
import { EditorModel } from '../../model/editormodel';
import { createNewSMARTWorkspace } from '../../model/workspace';
import { getNamespace } from '../../utils/ModelFunctions';
import { groupItems, setValueToIndex } from '../../utils/repo/CommonFunctions';
import { MMELDocument } from '../../model/document';
import React from 'react';
import RepoToolbar from './RepoToolbar';
import { createMapProfile } from '../../model/mapmodel';
import RepoGroup from './RepoGroup';
import { ProvisionRDF, RDFVersion } from '../../model/SemanticTriple';
import RepoRenameLoading, { RepoRenameAction } from './RepoRenameLoading';
import AITranslateLoading from './AITranslateLoading';
import { createChangeLog } from '../../model/changelog';

function matchFilter(item: RepoItems, filter: string) {
  return (
    filter === '' ||
    item.namespace.includes(filter) ||
    item.shortname.includes(filter) ||
    item.title.includes(filter)
  );
}

const RepoViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo?: MMELRepo;
  setRepo: (x: MMELRepo | undefined) => void;
  index: RepoIndex;
}> = function ({ isVisible, className, repo, setRepo, index }) {
  const { updateObjects, useRemoteUsername } = useContext(DatasetContext);

  const [filter, setFilter] = useState<string>('');

  const [toaster] = useState<IToaster>(Toaster.create());
  const [rename, setRename] = useState<RepoRenameAction | undefined>(undefined);
  const [aiRepo, setAiRepo] = useState<MMELRepo | undefined>(undefined);

  const [refs, imps, docs] = useMemo(() => groupItems(index), [index]);
  const frefs = useMemo(
    () => refs.filter(x => matchFilter(x, filter)),
    [refs, filter]
  );
  const fimps = useMemo(
    () => imps.filter(x => matchFilter(x, filter)),
    [imps, filter]
  );
  const fdocs = useMemo(
    () => docs.filter(x => matchFilter(x, filter)),
    [docs, filter]
  );
  const userData = useRemoteUsername();
  const username =
    userData === undefined ||
    userData.value === undefined ||
    userData.value.username === undefined
      ? 'Anonymous'
      : userData.value.username;

  async function saveIndexWithModel(
    updated: RepoIndex,
    ns: string,
    model: EditorModel
  ) {
    if (updateObjects) {
      if (ns !== undefined && model !== undefined) {
        const mp = createMapProfile();
        const rdf: ProvisionRDF = { roots: {}, nodes: {}, version: RDFVersion };
        mp.id = getNamespace(model);
        const task = updateObjects({
          commitMessage: COMMITMSG,
          _dangerouslySkipValidation: true,
          objectChangeset: {
            [repoIndexPath]: { newValue: updated },
            [getPathByNS(ns, RepoFileType.MODEL)]: {
              newValue: MMELToSerializable(model),
            },
            [getPathByNS(ns, RepoFileType.MAP)]: {
              newValue: mp,
            },
            [getPathByNS(ns, RepoFileType.WORKSPACE)]: {
              newValue: createNewSMARTWorkspace(),
            },
            [getPathByNS(ns, RepoFileType.RDF)]: {
              newValue: rdf,
            },
            [getPathByNS(ns, RepoFileType.HISTORY)]: {
              newValue: [createChangeLog(model, username)],
            },
          },
        });
        task.then(() => {
          toaster.show({
            message: `Done: model with namespace ${ns} added to the repository`,
            intent: 'success',
          });
        });
      }
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  async function saveIndexWithDoc(updated: RepoIndex, doc: MMELDocument) {
    if (updateObjects) {
      const task = updateObjects({
        commitMessage: COMMITMSG,
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoIndexPath]: { newValue: updated },
          [getPathByNS(doc.id, RepoFileType.MODEL)]: {
            newValue: doc,
          },
        },
      });
      task.then(() => {
        toaster.show({
          message: `Done: document with id ${doc.id} added to the repository`,
          intent: 'success',
        });
      });
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  function addItem(x: RepoItems): RepoIndex | undefined {
    if (x.namespace === '') {
      toaster.show({
        message: 'Invalid item: namespace is empty',
        intent: 'danger',
      });
      return undefined;
    }
    if (x.type !== 'Imp' && index[x.namespace] !== undefined) {
      toaster.show({
        message: 'Error: item with the same namespace already exists',
        intent: 'danger',
      });
      return undefined;
    }
    let count = 0;
    let name = x.namespace;
    while (index[name] !== undefined) {
      count++;
      name = x.namespace + `-${count}`;
    }
    if (count !== 0) {
      toaster.show({
        message: `Warning: item with the same namespace already exists, renamed namespace to ${name}`,
        intent: 'warning',
      });
      x.namespace = name;
      x.shortname = x.shortname !== '' ? x.shortname + `-${count}` : '';
      x.title = x.title !== '' ? x.title + `-${count}` : '';
    }
    const updated = setValueToIndex(index, x.namespace, x);
    return updated;
  }

  function addDoc(x: MMELDocument) {
    const item: RepoItems = {
      namespace: `${x.id}-doc`,
      shortname: x.id,
      title: x.title,
      date: new Date(),
      type: 'Doc',
    };
    x.id = item.namespace;
    const updated = addItem(item);
    if (updated !== undefined) {
      saveIndexWithDoc(updated, x);
    }
  }

  function addMW(m: ModelWrapper, type: RepoItemType) {
    const model = m.model;
    const meta = model.meta;
    const newItem: RepoItems = {
      namespace: meta.namespace,
      shortname: meta.shortname,
      title: meta.title,
      date: new Date(),
      type,
    };
    const updated = addItem(newItem);
    const requirePrompt = meta.namespace === newItem.namespace;
    if (!requirePrompt) {
      meta.namespace = newItem.namespace;
      meta.shortname = newItem.shortname;
      meta.title = newItem.title;
    }
    if (updated !== undefined) {
      saveIndexWithModel(updated, newItem.namespace, model);
    }
  }

  function deleteIndexWithDoc(updated: RepoIndex, ns: string) {
    if (updateObjects) {
      const task = updateObjects({
        commitMessage: COMMITMSG,
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoIndexPath]: { newValue: updated },
          [getPathByNS(ns, RepoFileType.MODEL)]: {
            newValue: null,
          },
        },
      });
      task.then(() => {
        toaster.show({
          message: `Done: document with id ${ns} removed from the repository`,
          intent: 'success',
        });
      });
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  function deleteIndexWithModel(updated: RepoIndex, ns: string) {
    if (updateObjects) {
      const task = updateObjects({
        commitMessage: COMMITMSG,
        _dangerouslySkipValidation: true,
        objectChangeset: {
          [repoIndexPath]: { newValue: updated },
          [getPathByNS(ns, RepoFileType.MODEL)]: {
            newValue: null,
          },
          [getPathByNS(ns, RepoFileType.MAP)]: {
            newValue: null,
          },
          [getPathByNS(ns, RepoFileType.WORKSPACE)]: {
            newValue: null,
          },
          [getPathByNS(ns, RepoFileType.RDF)]: {
            newValue: null,
          },
          [getPathByNS(ns, RepoFileType.HISTORY)]: {
            newValue: null,
          },
        },
      });
      task.then(() => {
        toaster.show({
          message: `Done: model with namespace ${ns} removed from the repository`,
          intent: 'success',
        });
      });
    } else {
      toaster.show({
        message: 'No write access to the repository',
        intent: 'danger',
      });
    }
  }

  function deleteItem(ns: string, type: RepoItemType) {
    const updated = { ...index };
    delete updated[ns];
    if (type === 'Doc') {
      deleteIndexWithDoc(updated, ns);
    } else {
      deleteIndexWithModel(updated, ns);
    }
    if (ns === repo?.ns) {
      setRepo(undefined);
    }
  }

  function sendMsg(msg: IToastProps) {
    toaster.show(msg);
  }

  function renameRepo(x: MMELRepo, name: string) {
    if (x.type === 'Imp') {
      if (x.ns === repo?.ns) {
        setRepo(undefined);
      }
      setRename({ old: x.ns, update: name });
    } else {
      toaster.show({
        message:
          'Cannot change namespace for models other than implementation models',
        intent: 'danger',
      });
    }
  }

  function updateAIResult(x: ModelWrapper | undefined) {
    if (x) {
      const prefix = aiRepo?.ns ?? '';
      let count = 0;
      let test = prefix;
      while (index[test] !== undefined) {
        count++;
        test = prefix + count.toString();
      }
      x.model.meta.namespace = test;
      addMW(x, 'Imp');
    }
    setAiRepo(undefined);
  }

  const toolbarProps = { addMW, addDoc, isBSI: true, index, setAiRepo };

  return isVisible ? (
    <Workspace
      toolbar={<RepoToolbar {...toolbarProps} />}
      className={className}
    >
      {rename && (
        <RepoRenameLoading
          action={rename}
          done={() => setRename(undefined)}
          sendMsg={sendMsg}
          index={index}
        />
      )}
      {aiRepo && (
        <AITranslateLoading
          source={aiRepo}
          done={updateAIResult}
          sendMsg={sendMsg}
        />
      )}
      <div style={{ height: 'calc(100vh - 50px)', overflowY: 'auto' }}>
        <RepoInfoPane
          repo={repo}
          index={index}
          onClose={() => setRepo(undefined)}
        />
        <InputGroup
          leftIcon="filter"
          onChange={x => setFilter(x.currentTarget.value)}
          placeholder="Filter..."
          value={filter}
        />
        <RepoGroup
          legend={`Reference models [${frefs.length} / ${refs.length}]`}
          list={frefs}
          deleteItem={deleteItem}
          setRepo={setRepo}
        />
        <RepoGroup
          legend={`Implementation models [${fimps.length} / ${imps.length}]`}
          list={fimps}
          deleteItem={deleteItem}
          repo={repo}
          setRepo={setRepo}
          renameRepo={renameRepo}
          index={index}
          sendMsg={sendMsg}
        />
        <RepoGroup
          legend={`SMART documents [${fdocs.length} / ${docs.length}]`}
          list={fdocs}
          deleteItem={deleteItem}
          setRepo={setRepo}
        />
      </div>
    </Workspace>
  ) : (
    <div></div>
  );
};

export default RepoViewer;
