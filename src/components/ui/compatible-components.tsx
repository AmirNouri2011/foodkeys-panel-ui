'use client';

// Basic components replacements for compatibility with rizzui v0.6.0
import React from 'react';
import { Button, Input } from 'rizzui';
import cn from '@/utils/class-names';
import SelectBox from '@/components/ui/select';

// components/ui/custom-alert.tsx

interface CustomAlertProps {
    children: React.ReactNode;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    className?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
                                                            children,
                                                            variant = "default",
                                                            className = ""
                                                        }) => {
    const baseStyles = "p-4 rounded-md mb-4 text-sm";
    const variantStyles = {
        default: "bg-gray-100 text-gray-800",
        info: "bg-blue-50 text-blue-800",
        success: "bg-green-50 text-green-800",
        warning: "bg-yellow-50 text-yellow-800",
        danger: "bg-red-50 text-red-800"
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
            {children}
        </div>
    );
};
// Card component replacement
export const Card = ({
                         children,
                         className,
                         ...props
                     }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Title component replacement
export const Title = ({
                          children,
                          className,
                          ...props
                      }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return (
        <h2
            className={cn(
                "text-lg font-semibold text-gray-900 dark:text-white",
                className
            )}
            {...props}
        >
            {children}
        </h2>
    );
};

// Search component replacement
export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
}

export const Search = ({
                           label,
                           error,
                           className,
                           inputClassName,
                           labelClassName,
                           ...props
                       }: SearchProps) => {
    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className={cn("block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1", labelClassName)}>
                    {label}
                </label>
            )}
            <Input
                type="search"
                className={cn(inputClassName)}
                error={error}
                {...props}
            />
        </div>
    );
};

// Select component replacement
export interface SelectProps {
    options: Array<{ label: string; value: string }>;
    label?: string;
    error?: string;
    helperText?: React.ReactNode;
    className?: string;
    selectClassName?: string;
    labelClassName?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    onChange?: (value: string) => void;
    onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}

export const Select = ({
                           options,
                           label,
                           error,
                           helperText,
                           className,
                           selectClassName,
                           labelClassName,
                           placeholder = 'انتخاب کنید',
                           value,
                           defaultValue,
                           disabled,
                           required,
                           name,
                           onChange,
                           onBlur,
                       }: SelectProps) => {
    return (
        <SelectBox
            className={cn("w-full", className)}
            label={label}
            labelClassName={labelClassName}
            selectClassName={selectClassName}
            options={options.map((option) => ({
                ...option,
                name: option.label,
            }))}
            value={value ?? defaultValue ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            isRequired={required}
            name={name}
            onChange={(selectedValue) => onChange?.(String(selectedValue))}
            onBlur={onBlur}
            getOptionValue={(option) => option.value}
            getOptionDisplayValue={(option) => option.label ?? option.name}
            displayValue={(selectedValue) =>
                options.find((option) => option.value === selectedValue)?.label ?? selectedValue
            }
            error={error}
            helperText={helperText}
        />
    );
};

// Table components
export const Table = ({
                          children,
                          className,
                          ...props
                      }: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
        <table
            className={cn(
                "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
                className
            )}
            {...props}
        >
            {children}
        </table>
    );
};

Table.Header = ({
                    children,
                    className,
                    ...props
                }: React.HTMLAttributes<HTMLTableSectionElement>) => {
    return (
        <thead
            className={cn(
                "bg-gray-50 dark:bg-gray-800",
                className
            )}
            {...props}
        >
        {children}
        </thead>
    );
};

Table.Body = ({
                  children,
                  className,
                  ...props
              }: React.HTMLAttributes<HTMLTableSectionElement>) => {
    return (
        <tbody
            className={cn(
                "divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900",
                className
            )}
            {...props}
        >
        {children}
        </tbody>
    );
};

Table.Row = ({
                 children,
                 className,
                 ...props
             }: React.HTMLAttributes<HTMLTableRowElement>) => {
    return (
        <tr
            className={cn(
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
};

Table.HeaderCell = ({
                        children,
                        className,
                        ...props
                    }: React.ThHTMLAttributes<HTMLTableCellElement>) => {
    return (
        <th
            className={cn(
                "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
};

Table.Cell = ({
                  children,
                  className,
                  ...props
              }: React.TdHTMLAttributes<HTMLTableCellElement>) => {
    return (
        <td
            className={cn(
                "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
};

// Pagination component replacement
interface PaginationProps {
    pageSize: number;
    total: number;
    current: number;
    onChange: (page: number) => void;
    className?: string;
}

export const Pagination = ({
                               pageSize,
                               total,
                               current,
                               onChange,
                               className,
                           }: PaginationProps) => {
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    const activePage = Math.min(Math.max(current, 1), Math.max(totalPages, 1));

    const renderPageButton = (pageNumber: number) => (
        <button
            type="button"
            key={pageNumber}
            className={cn(
                "relative inline-flex items-center px-4 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 dark:ring-gray-700",
                pageNumber === activePage
                    ? "z-10 bg-primary text-white focus:z-20"
                    : "bg-white text-gray-500 hover:bg-gray-50 focus:z-20 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
            onClick={() => onChange(pageNumber)}
            aria-current={pageNumber === activePage ? 'page' : undefined}
            aria-label={`صفحه ${pageNumber}`}
        >
            {pageNumber}
        </button>
    );

    const renderPageNumbers = () => {
        const range = (start: number, end: number) =>
            Array.from({ length: end - start + 1 }, (_, index) => start + index);
        let items: Array<number | 'ellipsis-start' | 'ellipsis-end'>;

        if (totalPages <= 7) {
            items = range(1, totalPages);
        } else if (activePage <= 4) {
            items = [...range(1, 5), 'ellipsis-end', totalPages];
        } else if (activePage >= totalPages - 3) {
            items = [1, 'ellipsis-start', ...range(totalPages - 4, totalPages)];
        } else {
            items = [
                1,
                'ellipsis-start',
                activePage - 1,
                activePage,
                activePage + 1,
                'ellipsis-end',
                totalPages,
            ];
        }

        return items.map((item) =>
            typeof item === 'number' ? renderPageButton(item) : (
                <span
                    key={item}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 dark:text-gray-300 dark:ring-gray-700"
                    aria-hidden="true"
                >
                    ...
                </span>
            )
        );
    };

    if (totalPages === 0) return null;

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <nav
                dir="rtl"
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="صفحه‌بندی"
            >
                <button
                    type="button"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:ring-gray-700 dark:hover:bg-gray-700"
                    onClick={() => onChange(activePage - 1)}
                    disabled={activePage <= 1}
                >
                    <span className="sr-only">صفحه قبل</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>

                </button>

                {renderPageNumbers()}

                <button
                    type="button"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:ring-gray-700 dark:hover:bg-gray-700"
                    onClick={() => onChange(activePage + 1)}
                    disabled={activePage >= totalPages}
                >
                    <span className="sr-only">صفحه بعد</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                </button>
            </nav>
        </div>
    );
};
