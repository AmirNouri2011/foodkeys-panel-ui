'use client';

import { useMedia } from '@/hooks/use-media';
import MessageList, {
  messageIdAtom,
} from '@/app/shared/support/inbox/message-list';
import MessageDetails from '@/app/shared/support/inbox/message-details';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { PiArrowRight } from 'react-icons/pi';

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isWide = useMedia('(min-width: 1024px)', false);
  const setMessageId = useSetAtom(messageIdAtom);

  useEffect(() => {
    setMessageId(params.id);
  }, [params.id, setMessageId]);

  return (
    <>
      <div className="mt-5 items-start lg:mt-7 lg:grid lg:grid-cols-[340px_1fr] lg:gap-5 2xl:grid-cols-[400px_1fr]">
        <div className="col-span-full mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl"
          >
            <PiArrowRight />
            بازگشت به تیکت‌ها
          </Button>
        </div>

        {isWide && <MessageList />}
        <MessageDetails />
      </div>
    </>
  );
}
