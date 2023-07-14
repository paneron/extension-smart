import React from 'react';
import { popoverPanelContainer } from '@/css/layout';
import MGDHeading from '@/smart/MGDComponents/MGDHeading';
import MGDLabel from '@/smart/MGDComponents/MGDLabel';
import {
  MeasureResult,
  MeasureRType,
  MTestItem,
  MTestReport,
} from '@/smart/model/Measurement';
import { DescriptionItem } from '@/smart/ui/common/description/fields';

const MeasurementTooltip: React.FC<{
  id: string;
  pageid: string;
  data: unknown;
}> = function ({ id, pageid, data }) {
  const result = data as MeasureResult;

  const { items, reports } = result;
  const report = reports[id];

  const pageresult = items[pageid] ?? {};
  const itemresult = pageresult[id];

  const contents =
    report !== undefined ? (
      <DescribeReportList report={report} />
    ) : itemresult === undefined ? (
      <MGDLabel>Not reached</MGDLabel>
    ) : itemresult === MeasureRType.OK ? (
      <MGDLabel>All tests in subprocess passed</MGDLabel>
    ) : itemresult === MeasureRType.CONTAINERROR ? (
      <MGDLabel>Some tests in subprocess failed</MGDLabel>
    ) : (
      <MGDLabel>No test</MGDLabel>
    );

  return <div style={popoverPanelContainer}>{contents}</div>;
};

const DescribeReportList: React.FC<{ report: MTestReport }> = function ({
  report,
}) {
  return (
    <>
      {report.map((r, index) => (
        <DescribeReport key={`report${index}`} report={r} />
      ))}
    </>
  );
};

const DescribeReport: React.FC<{ report: MTestItem }> = function ({ report }) {
  return (
    <>
      <MGDHeading>{report.description}</MGDHeading>
      <DescriptionItem label="Condition" value={report.cond} />
      <DescriptionItem
        label="Evaluated value (left)"
        value={showValue(report.left)}
      />
      <DescriptionItem
        label="Evaluated value (right)"
        value={showValue(report.right)}
      />
      <DescriptionItem label="Result" value={report.result ? 'Pass' : 'Fail'} />
    </>
  );
};

function showValue(x: number | string): string {
  if (typeof x === 'string') {
    return x;
  }
  return Number(x.toFixed(5)).toString();
}

export default MeasurementTooltip;
