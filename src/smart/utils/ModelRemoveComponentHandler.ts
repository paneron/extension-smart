import { DataType } from '../serialize/interface/baseinterface';
import { DeletableNodeTypes } from './constants';

export const DeleteConfirmMessgae: Record<DeletableNodeTypes, string> = {
  [DataType.PROCESS]: 'Confirm deleting the process?',
  [DataType.APPROVAL]: 'Confirm deleting the approval process?',
  [DataType.TIMEREVENT]: 'Confirm deleting the timer event?',
  [DataType.SIGNALCATCHEVENT]: 'Confirm deleting the signal catch event?',
  [DataType.EGATE]: 'Confirm deleting the gateway?',
  [DataType.ENDEVENT]: 'Confirm deleting the end event?',
};
