import type { IToastProps } from '@blueprintjs/core';
import React from 'react';
import { reactFlowContainerLayout } from '@/css/layout';
import type { MMELRepo, RepoIndex, RepoItems, RepoItemType } from '@/smart/model/repo';
import RepoChangeNSButton from '@/smart/ui/repo/RepoChangeNSButton';
import RepoModelFile from '@/smart/ui/repo/RepoItem';

const RepoGroup: React.FC<{
  legend: string;
  list: RepoItems[];
  deleteItem: (ns: string, type: RepoItemType) => void;
  setRepo: (x: MMELRepo | undefined) => void;
  renameRepo?: (x: MMELRepo, newName: string) => void;
  index?: RepoIndex;
  sendMsg?: (x: IToastProps) => void;
  repo?: MMELRepo;
}> = function ({
  legend,
  list,
  deleteItem,
  setRepo,
  renameRepo,
  index,
  sendMsg,
  repo,
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div style={reactFlowContainerLayout}>
        {Object.values(list).length === 0 && <EmptyMsg />}
        <div
          style={{
            display  : 'flex',
            flexWrap : 'wrap',
            gap      : 10,
            margin   : 10,
          }}
        >
          {list.map((x) => (
            <div
              key={x.namespace + x.shortname}
              style={{ position : 'relative' }}
            >
              <RepoModelFile
                key={x.namespace}
                file={x}
                onDelete={() => deleteItem(x.namespace, x.type)}
                onOpen={() => setRepo({ ns : x.namespace, type : x.type })}
              />
              {renameRepo && index && sendMsg && repo?.ns !== x.namespace && (
                <div
                  style={{
                    position : 'absolute',
                    right    : 10,
                    top      : 10,
                  }}
                >
                  <RepoChangeNSButton
                    initValue={x.namespace}
                    save={name =>
                      renameRepo({ ns : x.namespace, type : x.type }, name)
                    }
                    index={index}
                    sendMsg={sendMsg}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
};

const EmptyMsg = () => <p style={{ margin : 10 }}>No item in the repository.</p>;

export default RepoGroup;
