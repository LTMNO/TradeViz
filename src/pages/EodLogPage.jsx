import WorkflowLogView from '../components/WorkflowLogView';

export default function EodLogPage(props) {
  const { log } = props;
  const metaChips = [];
  if (log?.state?.client) {
    metaChips.push({ key: 'client', label: 'Client', code: log.state.client });
  }
  if (log?.state?.approved_by) {
    metaChips.push({
      key: 'approved',
      label: 'Approved by',
      code: log.state.approved_by,
      success: true,
    });
  }
  if (log?.state?.commentary_id) {
    metaChips.push({
      key: 'commentary',
      label: 'Sent',
      code: log.state.commentary_id,
      success: true,
    });
  }

  return (
    <WorkflowLogView
      {...props}
      demoActivePage="eodlog"
      title="EOD Commentary Log"
      completeTitle="Commentary sent"
      completeMessage={
        log && log.steps?.every((s) => s.timestamp)
          ? `End-of-day commentary approved and sent to ${log.state?.client ?? 'client'}${log.state?.commentary_id ? ` — ${log.state.commentary_id}` : ''}.`
          : undefined
      }
      metaChips={metaChips}
      flowAriaLabel="Scenario C workflow steps"
    />
  );
}
