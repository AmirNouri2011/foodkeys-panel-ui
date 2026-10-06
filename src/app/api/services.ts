// import useAxiosPrivate from '@/hooks/use-axios-private';
//
// export interface ServiceDTO {
//     id?: number;
//     name: string;
//     nameEn: string;
//     ranking: number;
//     rankingAll: number;
//     description: string;
//     subCategoryId: number;
//     elasticFields: string[];
//     data: any;
//     additionalData?: any;
//     serviceSchemaDTO?: {
//         schemaDefinition: any;
//         formTitle: string;
//         formDescription: string;
//     };
// }
//
// export interface ServiceResponse {
//     status: string;
//     message: string;
//     data: ServiceDTO;
// }
//
// export interface ServicesListResponse {
//     status: string;
//     message: string;
//     data: ServiceDTO[];
//     pagination: {
//         pageNumber: number;
//         pageSize: number;
//         totalPages: number;
//         totalElements: number;
//     };
// }
//
// export const useServiceApi = () => {
//     const axios = useAxiosPrivate();
//
//     const getServices = async (subCategoryId?: number, page = 1, size = 10) => {
//         let url = `/service?pageNumber=${page}&pageSize=${size}`;
//         if (subCategoryId) {
//             url += `&subCategoryId=${subCategoryId}`;
//         }
//
//         const response = await axios.get<ServicesListResponse>(url);
//         return response.data;
//     };
//
//     const getServiceById = async (id: number) => {
//         const response = await axios.get<ServiceResponse>(`/service/${id}`);
//         return response.data;
//     };
//
//     const getServicesBySubcategory = async (subCategoryName: string, page = 0, size = 10) => {
//         const response = await axios.get<ServicesListResponse>(
//             `/service/sub-category/${subCategoryName}?page=${page}&size=${size}`
//         );
//         return response.data;
//     };
//
//     const createService = async (service: ServiceDTO) => {
//         const response = await axios.post<ServiceResponse>('/service', service);
//         return response.data;
//     };
//
//     const updateService = async (id: number, service: ServiceDTO) => {
//         const response = await axios.put<ServiceResponse>(`/service/${id}`, service);
//         return response.data;
//     };
//
//     const deleteService = async (id: number) => {
//         const response = await axios.delete<ServiceResponse>(`/service/${id}`);
//         return response.data;
//     };
//
//     return {
//         getServices,
//         getServiceById,
//         getServicesBySubcategory,
//         createService,
//         updateService,
//         deleteService
//     };
// };
import { useCallback, useMemo } from 'react';
import useAxiosPrivate from '@/hooks/use-axios-private';

export interface ServiceDTO {
    id?: number;
    name: string;
    nameEn: string;
    ranking: number;
    rankingAll: number;
    description: string;
    subCategoryId: number;
    elasticFields: string[];
    data: any;
    additionalData?: any;
    galleryFiles?: Array<{ id: string }>;
    logo?: string;
    backgroundImage?: string;
    currentLogo?: string;
    currentBackgroundImage?: string;
    keyWords?: string[];
    keywords?: string[];
    tags?: string[];
    serviceSchemaDTO?: {
        schemaDefinition: any;
        validations?: Record<string, string>;
        formTitle: string;
        formDescription: string;
    };
}

export interface ServiceFileDTO {
    id: string;
    fileName?: string;
    filePath?: string;
    fileServiceType: string;
}

export interface ServiceResponse {
    status: string;
    message: string;
    data: ServiceDTO;
}

export interface ServicesListResponse {
    status: string;
    message: string;
    data: ServiceDTO[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalElements: number;
    };
}

export const useServiceApi = () => {
    const axios = useAxiosPrivate();

    const getServices = useCallback(
        async (subCategoryId?: number, page = 1, size = 10): Promise<ServicesListResponse> => {
            let url = `/service?pageNumber=${page}&pageSize=${size}`;
            if (subCategoryId != null) {
                url += `&subCategoryId=${subCategoryId}`;
            }
            const response = await axios.get<ServicesListResponse>(url);
            return response.data;
        },
        [axios],
    );

    const getServiceById = useCallback(
        async (id: number): Promise<ServiceResponse> => {
            const response = await axios.get<ServiceResponse>(`/service/${id}`);
            return response.data;
        },
        [axios],
    );

    const getServiceFiles = useCallback(
        async (id: number): Promise<ServiceFileDTO[]> => {
            const response = await axios.get<{
                status: string;
                data: ServiceFileDTO[];
            }>(`/service/${id}/files`);

            return response.data?.data || [];
        },
        [axios],
    );

    const getServicesBySubcategory = useCallback(
        async (
            subCategoryName: string,
            page = 1,
            size = 10,
            search = '',
        ): Promise<ServicesListResponse> => {
            const params = new URLSearchParams({
                pageNumber: String(page),
                pageSize: String(size),
            });

            if (search) {
                params.set('search', search);
            }

            const response = await axios.get<ServicesListResponse>(
                `/service/subcategory/by-name/${encodeURIComponent(subCategoryName)}?${params.toString()}`,
            );
            return response.data;
        },
        [axios],
    );

    const createService = useCallback(
        async (service: ServiceDTO): Promise<ServiceResponse> => {
            const response = await axios.post<ServiceResponse>('/service', service);
            return response.data;
        },
        [axios],
    );

    const updateService = useCallback(
        async (id: number, service: ServiceDTO): Promise<ServiceResponse> => {
            const response = await axios.put<ServiceResponse>(`/service/${id}`, service);
            return response.data;
        },
        [axios],
    );

    const deleteService = useCallback(
        async (id: number): Promise<ServiceResponse> => {
            const response = await axios.delete<ServiceResponse>(`/service/${id}`);
            return response.data;
        },
        [axios],
    );

    return useMemo(
        () => ({
            getServices,
            getServiceById,
            getServiceFiles,
            getServicesBySubcategory,
            createService,
            updateService,
            deleteService,
        }),
        [
            getServices,
            getServiceById,
            getServiceFiles,
            getServicesBySubcategory,
            createService,
            updateService,
            deleteService,
        ],
    );
};
