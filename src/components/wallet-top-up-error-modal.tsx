'use client';

import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button, Modal } from 'rizzui';

export default function WalletTopUpErrorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} customSize="420px">
      <div
        dir="rtl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="p-6 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-lighter text-red">
          <CircleAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 id={titleId} className="text-lg font-bold text-gray-900">
          مشکلی پیش آمده است
        </h3>
        <p id={descriptionId} className="mt-3 text-sm leading-7 text-gray-600">
          در حال حاضر امکان اتصال به درگاه پرداخت وجود ندارد. لطفاً بعداً دوباره
          تلاش کنید.
        </p>
        <Button type="button" onClick={onClose} className="mt-6 w-full">
          متوجه شدم
        </Button>
      </div>
    </Modal>
  );
}
