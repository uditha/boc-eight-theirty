export type TimeSeriesData = {
    date: string;
    value: number;
}

export type DataRecord = {
    record_date: string;
    [key: string]: string | number;
}

// Add this new type
export type MultiTimeSeriesData = {
    date: string;
    [key: string]: string | number;
}

/**
 * Generic utility to transform time series data
 * @param data Array of records with date and values
 * @param field Field name to extract
 * @param options Configuration options
 */
export const extractTimeSeriesData = <T extends DataRecord>(
    data: T[],
    field: keyof T,
    options?: {
        days?: number;
        sortDirection?: 'asc' | 'desc';
        dateField?: string;
    }
): TimeSeriesData[] => {
    const {
        days,
        sortDirection = 'asc',
        dateField = 'record_date'
    } = options || {};

    const sortedData = [...data].sort((a, b) => {
        const comparison = new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const filteredData = days ? sortedData.slice(-days) : sortedData;

    return filteredData.map(record => ({
        date: record[dateField] as string,
        value: record[field] as number
    }));
};

/**
 * Utility to transform multiple time series data fields
 * @param data Array of records with date and multiple values
 * @param fields Array of field names to extract
 * @param options Configuration options
 */
export const extractMultiTimeSeriesData = <T extends DataRecord>(
    data: T[],
    fields: (keyof T)[],
    options?: {
        days?: number;
        sortDirection?: 'asc' | 'desc';
        dateField?: string;
    }
): MultiTimeSeriesData[] => {
    const {
        days,
        sortDirection = 'asc',
        dateField = 'record_date'
    } = options || {};

    const sortedData = [...data].sort((a, b) => {
        const comparison = new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const filteredData = days ? sortedData.slice(-days) : sortedData;

    return filteredData.map(record => {
        const result: MultiTimeSeriesData = {
            date: record[dateField] as string
        };
        
        fields.forEach(field => {
            result[field as string] = record[field];
        });

        return result;
    });
};
