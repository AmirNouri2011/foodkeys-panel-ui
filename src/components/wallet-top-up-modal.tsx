'use client';

import { useEffect, useRef, useState } from 'react';
import { numberToWords } from '@persian-tools/persian-tools';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button, Modal } from 'rizzui';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAxiosPrivate from '@/hooks/use-axios-private';
import addCreditImg2 from 'public/addCreditLogo.webp';

const normalizeAmount = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
    .slice(0, 14);

export default function WalletTopUpModal({
  isOpen,
  onClose,
  initialAmount = 1_000_000,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}) {
  const _axios = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(String(initialAmount));
  const [amountError, setAmountError] = useState('');
  const numericAmount = Number(amount || 0);
  const paymentLock = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(String(initialAmount));
      setAmountError('');
    }
  }, [isOpen, initialAmount]);

  const handleDefaultAmountClick = (value: number) => {
    setAmount(String(value * 1_000_000));
    setAmountError('');
  };

  const handleSubmit = async () => {
    if (paymentLock.current) return;
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setAmountError('لطفاً یک مبلغ معتبر و بزرگ‌تر از صفر وارد کنید');
      return;
    }
    const startPayment = async () => {
      const API_URL = '/payment/start/3';
      try {
        const response = await _axios.post(API_URL, {
          amount: numericAmount * 10,
          redirectUrl: '/api/v1/client/panel/payment/callback',
          description: 'افزایش شارژ کیف پول',
          mobile: '09352388350',
          email: 'arminm4@gmail.com',
        });

        if (response.data.statusCode === 200) {
          return {
            data: response.data.data,
          };
        } else {
          toast.error('خطا در افزایش اعتبار');
        }
      } catch (error) {
        toast.error('خطا در افزایش اعتبار');
        console.error('Failed to start payment', error);
      }
    };
    paymentLock.current = true;
    setLoading(true);
    let response = await startPayment();
    if (response?.data?.url) window.location.href = response?.data?.url;
    else toast.error('خطا در افزایش اعتبار');
    paymentLock.current = false;
    setLoading(false);
  };
  const defaultAmounts = [1, 5, 10];

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => onClose()} customSize="1080px">
        <div className="m-auto rounded-xl bg-gray-50 px-7 pt-8 dark:bg-gray-100 dark:text-white">
          <div className="flex items-center justify-between">
            <h3>افزایش اعتبار کیف پول</h3>
            <ActionIcon size="sm" variant="text" onClick={() => onClose()}>
              <HiXMark className="h-auto w-6" strokeWidth={1.8} />
            </ActionIcon>
          </div>
          <div className="from-blue-500 to-indigo-700 flex max-h-screen items-center justify-center gap-5 bg-gradient-to-br px-1 py-6 text-black dark:bg-gray-100 sm:px-4 lg:gap-20">
            <div className="flex w-full flex-col items-start justify-center md:w-3/5">
              <Input
                label="مبلغ"
                suffix="تومان"
                placeholder="10,000,000"
                inputClassName="text-center"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                dir="ltr"
                className="w-full  dark:text-white"
                value={amount}
                error={amountError}
                onChange={(e) => {
                  setAmount(normalizeAmount(e.target.value));
                  setAmountError('');
                }}
              />
              <div className="flex w-full items-center justify-center gap-1">
                {defaultAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="mt-7 w-full rounded-md border border-black px-[2px] py-2 text-xs shadow-lg transition-all duration-100 ease-in-out hover:bg-gray-200 active:scale-95 dark:bg-[#fff1] dark:text-white dark:hover:bg-[#ffffff34] sm:px-2 sm:text-base lg:px-5"
                    onClick={() => handleDefaultAmountClick(value)}
                  >
                    {value} میلیون تومان
                  </button>
                ))}
              </div>
              <hr className="mt-7 h-[2px] w-full bg-gray-100 " />
              <div className="mt-7 flex items-center justify-center gap-3">
                <Badge color="success" rounded="md">
                  به حروف
                </Badge>
                <p className="font-bold dark:text-white">
                  {numericAmount > 0
                    ? `${String(numberToWords(numericAmount))} تومان`
                    : 'مبلغی وارد نشده است'}
                </p>
              </div>
              <Button
                className="mt-7 w-full  rounded-md  bg-gradient-to-r from-[#a8ff78] to-[#78ffd6] px-5 py-2 text-xl text-black transition-all duration-200 ease-in-out hover:scale-105 active:scale-100"
                onClick={handleSubmit}
                isLoading={loading}
                type="button"
              >
                پرداخت
              </Button>
            </div>
            <div className="hidden w-2/5 items-center justify-center md:flex">
              <Image
                src={addCreditImg2 || null}
                alt="افزایش اعتبار"
                className="w-64"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
