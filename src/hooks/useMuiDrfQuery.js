import { useMemo } from 'react';

/**
 * STRICTLY ALIGNED DRF QUERY HOOK
 * 1. Global Search: Uses 'search' param and overrides all column filters.
 * 2. Strict Fields: Aligned with CommonFilter (iexact) - farmer_name, crop_name.
 * 3. Suffix Mapping: Maps MUI operators to DRF suffixes for StockDetail fields.
 */
export const useMuiDrfQuery = ({ 
    paginationModel, 
    sortModel = [], 
    filterModel = { items: [] }, 
    searchValue,
    searchField = "search", 
    refreshTrigger
}) => {
    return useMemo(() => {
        const params = {
            limit: (paginationModel?.pageSize || 10).toString(),
            offset: ((paginationModel?.page || 0) * (paginationModel?.pageSize || 10)).toString(),
            deleted: "0" 
        };

        if (refreshTrigger) params.refresh = refreshTrigger.toString();

        const query = searchValue?.toString().trim();

        // 1. GLOBAL SEARCH MODE (Priority)
        if (query) {
            params[searchField] = query;
            return params; 
        } 
        
        // 2. COLUMN FILTERS MODE
        if (filterModel?.items && filterModel.items.length > 0) {
            filterModel.items.forEach((item) => {
                const { field, operator, value } = item;
                
                if (value === undefined || value === null || value === "" || field === 'total_price') return;

                let formattedValue = value;
                if (value instanceof Date) {
                    formattedValue = value.toISOString().split('T')[0]; 
                } else {
                    formattedValue = value.toString().trim();
                }

                const operatorMap = {
                    'contains': '__icontains',
                    'equals': '__iexact',
                    'startsWith': '__istartswith',
                    'endsWith': '__iendswith',
                    '=': '__iexact',
                    '>': '__gt',
                    '>=': '__gte',
                    '<': '__lt',
                    '<=': '__lte',
                    'is': '__iexact',
                };

                const suffix = operatorMap[operator] || '__iexact';
                
                /**
                 * BACKEND ALIGNMENT BASED ON filters.py:
                 * CommonFilter defines crop_name and farmer_name with lookup_expr="iexact".
                 * These fields MUST NOT have suffixes.
                 */
                const strictFields = ['farmer_name', 'crop_name', 'wholesaler_name'];

                if (strictFields.includes(field)) {
                    // Result: ?farmer_name=weiobewuf (Matches iexact in backend)
                    // We DO NOT append the suffix here because your CommonFilter 
                    // handles the 'iexact' logic internally.
                    params[field] = formattedValue;
                } else {
                    // Result: ?quantity__gte=10 (Matches fields in StockDetailFilter)
                    params[`${field}${suffix}`] = formattedValue;
                }
            });
        }

        // 3. ORDERING LOGIC
        if (Array.isArray(sortModel) && sortModel.length > 0) {
            const validSorts = sortModel
                .filter(item => item.field !== 'total_price')
                .map((item) => {
                    const prefix = item.sort === 'desc' ? '-' : '';
                    let orderingField = item.field;
                    
                    if (orderingField === 'wholesaler_name') orderingField = 'stock_id__w_id__first_name';
                    if (orderingField === 'farmer_name') orderingField = 'stock_id__farmer_id__first_name';
                    if (orderingField === 'crop_name') orderingField = 'crop_id__crop_name';
                    
                    return `${prefix}${orderingField}`;
                });

            if (validSorts.length > 0) {
                params.ordering = validSorts.join(',');
            }
        }

        return params; 
    }, [
        paginationModel?.page, 
        paginationModel?.pageSize, 
        JSON.stringify(sortModel), 
        JSON.stringify(filterModel?.items), 
        searchValue,
        searchField,
        refreshTrigger
    ]);
};