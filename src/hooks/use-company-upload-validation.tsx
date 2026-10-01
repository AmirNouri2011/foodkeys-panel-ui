'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import useAxiosPrivate from './use-axios-private';
import { API_BASE_URL } from '@/config/api.config';
import {
  FileUploadValidation,
  uploadAccept,
} from '@/utils/file-upload-validation';

export interface UploadValidationState {
  validation?: FileUploadValidation;
  loading: boolean;
  ready: boolean;
  accept?: string;
  retry: () => void;
}
const UploadValidationContext = createContext<{
  validations: Record<string, FileUploadValidation>;
  loading: boolean;
  retry: () => void;
} | null>(null);

export function CompanyUploadValidationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const axios = useAxiosPrivate();
  const [validations, setValidations] = useState<
    Record<string, FileUploadValidation>
  >({});
  const [loading, setLoading] = useState(true);
  const activeRequest = useRef<AbortController>();
  const load = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    const base = `${API_BASE_URL}/file-upload-validations`;
    const results = await Promise.allSettled([
      axios.get(`${base}?owner=company`, {
        signal: controller.signal,
        timeout: 15000,
      }),
      axios.get(`${base}/BRAND_IMAGE`, {
        signal: controller.signal,
        timeout: 15000,
      }),
      axios.get(`${base}/PRODUCT_PICTURE`, {
        signal: controller.signal,
        timeout: 15000,
      }),
    ]);
    if (controller.signal.aborted) return;
    const next: Record<string, FileUploadValidation> = {};
    results.forEach((result) => {
      if (
        result.status !== 'fulfilled' ||
        result.value.data?.status !== 'SUCCESS'
      )
        return;
      const data = result.value.data.data;
      const rules = Array.isArray(data?.company)
        ? data.company
        : data?.fileType
        ? [data]
        : [];
      rules.forEach((rule: FileUploadValidation) => {
        if (rule.fileType) next[rule.fileType] = rule;
      });
    });
    setValidations(next);
    setLoading(false);
  }, [axios]);
  useEffect(() => {
    void load();
    return () => activeRequest.current?.abort();
  }, [load]);
  return (
    <UploadValidationContext.Provider
      value={{ validations, loading, retry: () => void load() }}
    >
      {children}
    </UploadValidationContext.Provider>
  );
}

export function useCompanyUploadValidation(
  fileType: string
): UploadValidationState {
  const context = useContext(UploadValidationContext);
  const validation = context?.validations[fileType];
  return {
    validation,
    loading: context?.loading ?? false,
    ready: !!validation && !context?.loading,
    accept: uploadAccept(validation),
    retry: context?.retry ?? (() => {}),
  };
}
