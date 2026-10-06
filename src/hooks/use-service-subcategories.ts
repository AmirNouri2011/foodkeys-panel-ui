import { useState, useEffect, useCallback } from 'react';
import useAxiosPrivate from '@/hooks/use-axios-private';

export type ServiceSubCategoryDTO = {
  subCategoryId: number;
  subCategoryName: string;
  subCategoryDisplayName: string;
  categoryId: number;
  categoryName: string;
  categoryDisplayName: string;
  subCategoryDescription: string;
  subCategoryIcon: string;
  latestSubmissionDateTime: string;
  latestSubmissionDateTimeFa: string;
  latestSubmissions: Array<{
    avatar: string;
    submissionDate: string;
    displayName: string;
  }>;
};

export type ServiceSchemaDTO = {
  schemaDefinition: any;
  validations?: Record<string, string>;
  formTitle: string;
  formDescription: string;
};

// Default subcategories when API is not responding
const defaultSubcategories: ServiceSubCategoryDTO[] = [
  {
    subCategoryId: 1,
    subCategoryName: 'exhibitions',
    subCategoryDisplayName: 'نمایشگاه‌های داخلی و خارجی',
    categoryId: 4,
    categoryName: 'service',
    categoryDisplayName: 'بانک خدمات',
    subCategoryDescription: 'نمایشگاه‌های داخلی و خارجی صنایع غذایی و کشاورزی',
    subCategoryIcon: 'exhibition',
    latestSubmissionDateTime: '',
    latestSubmissionDateTimeFa: '',
    latestSubmissions: [],
  },
  {
    subCategoryId: 2,
    subCategoryName: 'conferences',
    subCategoryDisplayName: 'همایش‌های داخلی و خارجی',
    categoryId: 4,
    categoryName: 'service',
    categoryDisplayName: 'بانک خدمات',
    subCategoryDescription: 'همایش‌های داخلی و خارجی صنایع غذایی و کشاورزی',
    subCategoryIcon: 'conference',
    latestSubmissionDateTime: '',
    latestSubmissionDateTimeFa: '',
    latestSubmissions: [],
  },
  {
    subCategoryId: 3,
    subCategoryName: 'employment',
    subCategoryDisplayName: 'آگهی استخدام شرکت‌ها',
    categoryId: 4,
    categoryName: 'service',
    categoryDisplayName: 'بانک خدمات',
    subCategoryDescription: 'آگهی استخدام شرکت‌های فعال در صنعت غذا و کشاورزی',
    subCategoryIcon: 'employment',
    latestSubmissionDateTime: '',
    latestSubmissionDateTimeFa: '',
    latestSubmissions: [],
  },
  {
    subCategoryId: 4,
    subCategoryName: 'jobs',
    subCategoryDisplayName: 'مشخصات متقاضیان استخدام',
    categoryId: 4,
    categoryName: 'service',
    categoryDisplayName: 'بانک خدمات',
    subCategoryDescription: 'اطلاعات متقاضیان استخدام در صنعت غذا و کشاورزی',
    subCategoryIcon: 'jobs',
    latestSubmissionDateTime: '',
    latestSubmissionDateTimeFa: '',
    latestSubmissions: [],
  },
];

export const useServiceSubcategories = () => {
  const [subcategories, setSubcategories] =
    useState<ServiceSubCategoryDTO[]>(defaultSubcategories);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const axios = useAxiosPrivate();

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          '/service/subcategory?categoryId=4&pageSize=100'
        );
        if (
          response.data &&
          response.data.status === 'SUCCESS' &&
          response.data.data
        ) {
          setSubcategories(response.data.data);
        } else {
          console.warn(
            'Using default subcategories due to API response format'
          );
          // Keep using default subcategories
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Error fetching subcategories');
        // Keep using default subcategories
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [axios]);

  return { subcategories, loading, error };
};

export const useServiceSchema = (subCategoryId: number | null) => {
  const [schema, setSchema] = useState<ServiceSchemaDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const axios = useAxiosPrivate();

  const fetchSchema = useCallback(async () => {
    if (!subCategoryId) {
      setSchema(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/subcategory/${subCategoryId}/schema`);
      if (
        response.data &&
        response.data.status === 'SUCCESS' &&
        response.data.data
      ) {
        setSchema(response.data.data);
      } else {
        setSchema(null);
        setError('No schema found or invalid format');
      }
    } catch (err) {
      console.error('Error fetching schema:', err);
      setSchema(null);
      setError('Error fetching schema');
    } finally {
      setLoading(false);
    }
  }, [axios, subCategoryId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  return { schema, loading, error, retry: fetchSchema };
};
