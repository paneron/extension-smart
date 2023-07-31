import { IToastProps } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import React from 'react';
import { useContext, useMemo } from 'react';
import { MMELDocument } from '@/smart/model/document';
import { ModelWrapper } from '@/smart/model/modelwrapper';
import { MMELRepo } from '@/smart/model/repo';
import { aiTranslate } from '@/smart/utils/ai/aiagent';
import { getPathByNS, RepoFileType } from '@/smart/utils/repo/io';
import { LoadingIcon } from '@/smart/ui/common/Loading';

const AITranslateLoading: React.FC<{
  source: MMELRepo;
  done: (x: ModelWrapper | undefined) => void;
  sendMsg: (x: IToastProps) => void;
}> = function ({ source, done, sendMsg }) {
  const { useObjectData } = useContext(DatasetContext);

  const path = getPathByNS(source.ns, RepoFileType.MODEL);

  const docFile = useObjectData({
    objectPaths : [path],
  });

  useMemo(() => {
    if (!docFile.isUpdating) {
      const doc = docFile.value.data[path] as MMELDocument;
      const task = aiTranslate(doc);
      task.then(x => {
        sendMsg({
          message : 'Done: model translated',
          intent  : 'success',
        });
        done(x);
      });
    }
  }, [docFile.isUpdating]);

  return (
    <div
      style={{
        position : 'fixed',
        right    : 30,
        bottom   : 20,
      }}
    >
      <LoadingIcon small />
    </div>
  );
};

export default AITranslateLoading;
