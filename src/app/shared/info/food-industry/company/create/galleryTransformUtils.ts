export const transformGalleryFiles = (galleryFiles: any[]) => {
    if (!galleryFiles || !Array.isArray(galleryFiles) || galleryFiles.length === 0) {
        return {
            contacts: [],
            certificates: [],
            products: [],
            sliders: [],
            catalogs: [],
            videos: [],
            documents: [],
            officeEnvironments: []
        };
    }

    // Initialize the result object with empty arrays for each gallery type
    const result = {
        contacts: [],
        certificates: [],
        products: [],
        sliders: [],
        catalogs: [],
        videos: [],
        documents: [],
        officeEnvironments: []
    };

    // Process each gallery file
    galleryFiles.forEach(file => {
        // Skip files without a file service type
        if (!file.fileServiceType) return;

        // Accept JSON objects and legacy string metadata when loading a company.
        let metadata = {};
        try {
            if (file.metadata) {
                const parsed = typeof file.metadata === 'string'
                    ? JSON.parse(file.metadata)
                    : file.metadata;
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    metadata = parsed;
                }
            }
        } catch (error) {
            console.error(`Error parsing metadata for file ${file.id}:`, error);
        }

        // Create a base object with common properties
        const baseFileObj = {
            ...file,
            ...metadata,
            uploadedFileId: file.id, // Store the file ID
            id: file.id, // Keep original ID
            filePath: file.filePath,
            fileName: file.fileName
        };

        // Map to the appropriate gallery section based on fileServiceType
        switch (file.fileServiceType) {
            case 'COMPANY_GALLERY_CONTACT':
                result.contacts.push(baseFileObj);
                break;

            case 'COMPANY_GALLERY_CERTIFICATE':
                result.certificates.push(baseFileObj);
                break;

            case 'COMPANY_GALLERY_PRODUCT':
                result.products.push(baseFileObj);
                break;

            case 'COMPANY_GALLERY_SLIDER':
                result.sliders.push(baseFileObj);
                break;

            case 'COMPANY_GALLERY_CATALOG':
                result.catalogs.push(baseFileObj);
                break;
            case 'COMPANY_GALLERY_VIDEO':
                result.videos.push(baseFileObj);
                break;
            case 'COMPANY_GALLERY_DOCUMENT':
                result.documents.push(baseFileObj);
                break;
            case 'COMPANY_GALLERY_OFFICE_ENVIRONMENT':
                result.officeEnvironments.push(baseFileObj);
                break;
        }
    });

    // Sort each category array by priority if available
    Object.keys(result).forEach(key => {
        if (result[key].length > 0) {
            result[key].sort((a, b) => {
                // Default to priority 1 if not set
                const priorityA = a.priority || 1;
                const priorityB = b.priority || 1;
                return priorityA - priorityB;
            });
        }
    });

    return result;
};

/**
 * Prepares gallery data for API submission
 * @param galleryData The gallery data from the form
 * @returns An array of gallery files formatted for API submission
 */
export function prepareGalleryFilesForSubmission(galleryData: any) {
    if (!galleryData) return [];
    // console.log(`Gallery Data: ${JSON.stringify(galleryData)}`)
    const galleryFiles: any[] = [];
    const allSections = ['products', 'certificates', 'contacts', 'sliders', 'catalogs', 'videos', 'documents', 'officeEnvironments'];

    allSections.forEach(section => {
        if (galleryData[section] && Array.isArray(galleryData[section])) {
            galleryData[section].forEach((item: any) => {
                // Skip items without an ID
                if (!item.id && !item.uploadedFileId) return;

                // Get file ID from either id or uploadedFileId
                const fileId = item.id || item.uploadedFileId;

                // Skip if no valid ID
                if (!fileId) return;

                // Determine service type based on section
                let fileServiceType = '';
                switch(section) {
                    case 'products':
                        fileServiceType = 'COMPANY_GALLERY_PRODUCT';
                        break;
                    case 'certificates':
                        fileServiceType = 'COMPANY_GALLERY_CERTIFICATE';
                        break;
                    case 'contacts':
                        fileServiceType = 'COMPANY_GALLERY_CONTACT';
                        break;
                    case 'sliders':
                        fileServiceType = 'COMPANY_GALLERY_SLIDER';
                        break;
                    case 'catalogs':
                        fileServiceType = 'COMPANY_GALLERY_CATALOG';
                        break;
                    case 'videos':
                        fileServiceType = 'COMPANY_GALLERY_VIDEO';
                        break;
                    case 'documents':
                        fileServiceType = 'COMPANY_GALLERY_DOCUMENT';
                        break;
                    case 'officeEnvironments':
                        fileServiceType = 'COMPANY_GALLERY_OFFICE_ENVIRONMENT';
                        break;
                }

                // Create metadata object
                const metadata: any = {};
                Object.keys(item).forEach(key => {
                    // Skip special fields
                    if (['id', 'uploadedFileId', 'filePath', 'fileName', 'originalFileName', 'metadata', 'fileServiceType'].includes(key)) return;
                    metadata[key] = item[key];
                });

                // Add to gallery files
                galleryFiles.push({
                    id: fileId,
                    metadata,
                    fileServiceType
                });
            });
        }
    });

    return galleryFiles;
}

/**
 * Utility function for direct usage in components
 * @param data The company data object containing galleryFiles
 * @returns The data object with the transformed gallery property added
 */
export const prepareCompanyDataWithGallery = (data: any) => {
    if (!data) return data;

    if (data.galleryFiles && Array.isArray(data.galleryFiles)) {
        const transformedGallery = transformGalleryFiles(data.galleryFiles);
        return {
            ...data,
            gallery: transformedGallery
        };
    }

    return data;
};

/**
 * Function to prepare all form data for submission, including gallery files
 * @param formData The complete form data object
 * @returns The prepared data with galleryFiles instead of gallery
 */
export const prepareFormDataForSubmission = (formData: any) => {
    if (!formData) return formData;

    // Get a copy of the data
    const preparedData = { ...formData };

    // Process gallery data if it exists
    if (preparedData.gallery) {
        // Transform gallery to galleryFiles
        preparedData.galleryFiles = prepareGalleryFilesForSubmission(preparedData.gallery);

        // Remove the gallery property as it's not needed for API
        delete preparedData.gallery;
    }

    return preparedData;
};
