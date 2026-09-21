'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CaptchaChallenge,
  CaptchaPayload,
  fetchCaptchaChallenge,
  toCaptchaImageSrc,
} from '@/utils/auth-captcha';

type UseCaptchaOptions = {
  /** Fetch a challenge as soon as the hook mounts */
  autoFetch?: boolean;
};

export function useCaptcha(options: UseCaptchaOptions = {}) {
  const { autoFetch = false } = options;
  const [token, setToken] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loadError, setLoadError] = useState<string | undefined>();
  const tokenRef = useRef('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setLoadError(undefined);
    setAnswer('');
    try {
      const challenge: CaptchaChallenge = await fetchCaptchaChallenge();
      tokenRef.current = challenge.token;
      setToken(challenge.token);
      setImageSrc(toCaptchaImageSrc(challenge.image));
      return true;
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
      setLoadError(
        'در دریافت تصویر کپچا مشکلی پیش آمد. اتصال اینترنت یا وضعیت سرور را بررسی و دوباره تلاش کنید.'
      );
      tokenRef.current = '';
      setToken('');
      setImageSrc('');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      void refresh();
    }
  }, [autoFetch, refresh]);

  const clearAnswer = useCallback(() => setAnswer(''), []);

  const getPayload = useCallback((): CaptchaPayload | undefined => {
    const currentToken = tokenRef.current || token;
    if (!currentToken) return undefined;
    return {
      captchaToken: currentToken,
      captchaAnswer: answer,
    };
  }, [answer, token]);

  return {
    token,
    imageSrc,
    answer,
    setAnswer,
    loading,
    error,
    loadError,
    setError,
    refresh,
    clearAnswer,
    getPayload,
    hasChallenge: Boolean(token && imageSrc),
  };
}
