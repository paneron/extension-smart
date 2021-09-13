import { EditorModel } from '../../../model/editormodel';
import { EnviromentValues } from '../../../model/Measurement';
import { checkModelMeasurement } from '../../../utils/measurement/Checker';
import { Log27001Record, StreamReading } from './model';

export function testMeasurement27001( model: EditorModel, reading: StreamReading ): Log27001Record {
  return {
    time: new Date(),
    result: checkModelMeasurement(model, get27001Values(reading)),
    data: reading,
  }  
}

function get27001Values(reading: StreamReading): EnviromentValues {
  return {
    NumConnection: reading.connections,
    NumFailLogin: [reading.failed],
    NumLogin: [reading.login]
  };
}
