import { EditorModel } from '@/smart/model/editormodel';
import { EnviromentValues } from '@/smart/model/Measurement';
import { checkModelMeasurement } from '@/smart/utils/measurement/Checker';
import { Log27001Record, StreamReading } from '@/smart/ui/application/ISO27001/model';

export function testMeasurement27001(
  model: EditorModel,
  reading: StreamReading
): Log27001Record {
  return {
    time   : new Date(),
    result : checkModelMeasurement(model, get27001Values(reading)),
    data   : reading,
  };
}

function get27001Values(reading: StreamReading): EnviromentValues {
  return {
    NumConnection : reading.connections,
    NumFailLogin  : [reading.failed],
    NumLogin      : [reading.login],
  };
}
