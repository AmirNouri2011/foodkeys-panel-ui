'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Textarea, Badge, ActionIcon } from 'rizzui';
import { ChevronLeft, ChevronRight, Edit, Eye, Search as SearchIcon } from 'lucide-react';
import { useServiceApi, ServiceDTO, ServicesListResponse } from '@/app/api/services';
import { routes } from '@/config/routes';
import Spinner from '@/components/ui/spinner';
import { useServiceSubcategories } from '@/hooks/use-service-subcategories';
import {Card, Title, Table, Pagination, Search, CustomAlert} from '@/components/ui/compatible-components';

export default function ServiceListPage() {
    const { subcategory } = useParams();
    const router = useRouter();
    const serviceApi = useServiceApi();
    const { subcategories } = useServiceSubcategories();

    // Find subcategory display name
    const currentSubcategory = subcategories.find(
        subcat => subcat.subCategoryName === subcategory
    );

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<ServiceDTO[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pageSizeInput, setPageSizeInput] = useState('10');
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setPageNumber(1);
            setDebouncedSearch(searchTerm.trim());
        }, 500);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch services for this subcategory
    useEffect(() => {
        let isCurrentRequest = true;

        const fetchServices = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // For now, using getServices with the subcategory's ID if available
                let response: ServicesListResponse;

                // if (currentSubcategory?.subCategoryId) {
                //     response = await serviceApi.getServices(
                //         currentSubcategory.subCategoryId,
                //         pagination.pageNumber,
                //         pagination.pageSize
                //     );
                // } else {
                    // Fallback - try to get by subcategory name
                    response = await serviceApi.getServicesBySubcategory(
                        subcategory as string,
                        pageNumber,
                        pageSize,
                        debouncedSearch,
                    );
                // }

                if (!isCurrentRequest) return;

                if (response && response.status === 'SUCCESS') {
                    setServices(response.data);
                    setPagination({
                        totalPages: response.pagination.totalPages,
                        totalElements: response.pagination.totalElements,
                    });
                } else {
                    setError('خطا در دریافت لیست سرویس‌ها');
                }
            } catch (err) {
                if (!isCurrentRequest) return;

                console.error('Error fetching services:', err);
                setError('خطا در دریافت لیست سرویس‌ها');
                setServices([]); // Reset in case of error
            } finally {
                if (isCurrentRequest) {
                    setIsLoading(false);
                }
            }
        };

        if (subcategory) {
            fetchServices();
        }

        return () => {
            isCurrentRequest = false;
        };
    }, [subcategory, pageNumber, pageSize, debouncedSearch, serviceApi]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setPageNumber(Math.min(Math.max(page, 1), pagination.totalPages));
    };

    const handlePageSizeChange = (value: string) => {
        setPageSizeInput(value);
        const nextPageSize = Number(value);

        if (value && Number.isInteger(nextPageSize) && nextPageSize > 0) {
            setPageNumber(1);
            setPageSize(nextPageSize);
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'نامشخص';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                    <Button
                        variant="text"
                        className="mr-2"
                        onClick={() => router.back()}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                    <Title className="text-xl md:text-2xl">
                        لیست {currentSubcategory?.subCategoryDisplayName || subcategory}
                    </Title>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        {/* <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /> */}
                        <Search
                            placeholder="جستجو..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-full md:w-[280px]"
                            inputClassName="pl-10"
                        />
                    </div>

                    {/* <Input
                        type="number"
                        min={1}
                        value={pageSizeInput}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        onBlur={() => setPageSizeInput(String(pageSize))}
                        className="w-full md:w-32"
                    /> */}

                    <Button
                        onClick={() => router.push(routes.info.serviceIndustrySubCategoryCreate(subcategory as string))}
                    >
                        افزودن {currentSubcategory?.subCategoryDisplayName || subcategory} جدید
                    </Button>
                </div>
            </div>

            {error && (
                <CustomAlert variant="danger" className="mb-6">
                    {error}
                </CustomAlert>
            )}

            <Card>
                {isLoading ? (
                    <div className="flex justify-center items-center p-10">
                        <Spinner size="xl" />
                        {/* <p className="ms-3">در حال بارگذاری...</p> */}
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center p-10">
                        <Title className="text-lg mb-2">هیچ سرویسی یافت نشد</Title>
                        <p className="text-gray-500 mb-6">
                            برای افزودن اولین {currentSubcategory?.subCategoryDisplayName || subcategory} روی دکمه افزودن کلیک کنید
                        </p>
                        <Button
                            onClick={() => router.push(routes.info.serviceIndustrySubCategoryCreate(subcategory as string))}
                        >
                            افزودن {currentSubcategory?.subCategoryDisplayName || subcategory} جدید
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>#</Table.HeaderCell>
                                        <Table.HeaderCell>نام</Table.HeaderCell>
                                        <Table.HeaderCell>نام انگلیسی</Table.HeaderCell>
                                        <Table.HeaderCell>رتبه</Table.HeaderCell>
                                        <Table.HeaderCell>تاریخ ایجاد</Table.HeaderCell>
                                        <Table.HeaderCell>وضعیت</Table.HeaderCell>
                                        <Table.HeaderCell>عملیات</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {services.map((service, index) => (
                                        <Table.Row key={service.id}>
                                            <Table.Cell>
                                                {(pageNumber - 1) * pageSize + index + 1}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <p className="font-medium">{service.name}</p>
                                            </Table.Cell>
                                            <Table.Cell>{service.nameEn}</Table.Cell>
                                            <Table.Cell>{service.ranking}</Table.Cell>
                                            <Table.Cell>
                                                {/* Replace with actual creation date from your API */}
                                                {formatDate(service.additionalData?.createdAt || new Date().toISOString())}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge variant="flat" color="success">
                                                    فعال
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-3">
                                                    <ActionIcon
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.push(
                                                            `/info/service/${subcategory}/${service.id}/view`
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.push(
                                                            routes.info.serviceIndustryEdit(subcategory as string, service.id || 0)
                                                        )}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </ActionIcon>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>

                        <div className="flex justify-center py-5">
                            <Pagination
                                pageSize={pageSize}
                                total={pagination.totalElements}
                                current={pageNumber}
                                onChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
