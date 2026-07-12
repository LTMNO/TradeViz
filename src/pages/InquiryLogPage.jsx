import WorkflowLogView from '../components/WorkflowLogView';

export default function InquiryLogPage(props) {
  const { log } = props;
  const metaChips = [];
  if (log?.state?.client) {
    metaChips.push({ key: 'client', label: 'Client', code: log.state.client });
  }
  if (log?.state?.instrument) {
    metaChips.push({ key: 'instrument', label: 'Instrument', code: log.state.instrument });
  }
  if (log?.state?.last_price?.price) {
    metaChips.push({
      key: 'price',
      label: 'Price',
      code: String(log.state.last_price.price),
      success: true,
    });
  }
  if (log?.state?.message_id) {
    metaChips.push({
      key: 'msg',
      label: 'Sent',
      code: log.state.message_id,
      success: true,
    });
  }

  return (
    <WorkflowLogView
      {...props}
      demoActivePage="inquirylog"
      title="Pricing Inquiry Log"
      completeTitle="Reply sent"
      completeMessage={
        log && log.steps?.every((s) => s.timestamp)
          ? `Pricing reply approved and sent to ${log.state?.client ?? 'client'}${log.state?.message_id ? ` — ${log.state.message_id}` : ''}.`
          : undefined
      }
      metaChips={metaChips}
      flowAriaLabel="Scenario A workflow steps"
    />
  );
}
