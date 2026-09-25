import InboxTabs from '@/app/shared/support/inbox/inbox-tabs';
import MessageList from '@/app/shared/support/inbox/message-list';

export default function SupportInbox({ refetchTickets }) {
  return (
    <div className="mt-5 items-start gap-5 xl:grid xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.65fr)]">
      <MessageList
        refetchTickets={refetchTickets}
        className="min-w-0"
      />
      <InboxTabs className="hidden min-w-0 xl:block" />
    </div>
  );
}
