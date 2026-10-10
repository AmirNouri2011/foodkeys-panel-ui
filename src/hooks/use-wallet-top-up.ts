'use client';

import { useRef, useState } from 'react';
import useAxiosPrivate from '@/hooks/use-axios-private';

export default function useWalletTopUp() {
  const axios = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const paymentLock = useRef(false);

  const startPayment = async (amount: number) => {
    if (paymentLock.current) return;
    if (!Number.isSafeInteger(amount * 10) || amount <= 0) return;

    paymentLock.current = true;
    setPaymentError(false);
    setLoading(true);
    try {
      const response = await axios.post('/payment/start/3', {
        amount: amount * 10,
        redirectUrl: '/api/v1/client/panel/payment/callback',
        description: 'افزایش شارژ کیف پول',
        mobile: '09352388350',
        email: 'arminm4@gmail.com',
      });
      if (response.data.statusCode !== 200 || !response.data.data?.url)
        throw new Error('Payment gateway URL was not returned');

      // Only the confirmed server balance should update the wallet.
      window.location.href = response.data.data.url;
    } catch {
      setPaymentError(true);
      paymentLock.current = false;
      setLoading(false);
    }
  };

  return {
    startPayment,
    loading,
    paymentError,
    dismissPaymentError: () => setPaymentError(false),
  };
}
