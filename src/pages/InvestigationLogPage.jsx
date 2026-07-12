import WorkflowLogView from '../components/WorkflowLogView';

export default function InvestigationLogPage(props) {
  const { log } = props;
  const metaChips = [];
  if (log?.state?.trade_id) {
    metaChips.push({ key: 'trade', label: 'Trade', code: log.state.trade_id });
  }
  if (log?.state?.last_ops_request?.id) {
    metaChips.push({
      key: 'ops',
      label: 'Ops',
      code: log.state.last_ops_request.id,
      success: true,
    });
  }

  return (
    <WorkflowLogView
      {...props}
      demoActivePage="log"
      title="Investigation Log"
      completeTitle="Workflow resolved"
      completeMessage={
        log && log.steps?.every((s) => s.timestamp)
          ? `All five steps completed${log.state?.trade_id ? ` for trade ${log.state.trade_id}` : ''}${log.state?.last_ops_request?.id ? ` — ops request ${log.state.last_ops_request.id}` : ''}.`
          : undefined
      }
      metaChips={metaChips}
      flowAriaLabel="Scenario B workflow steps"
    />
  );
}
