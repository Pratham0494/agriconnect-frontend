import { useMemo } from 'react';

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

        // 1. Global Search Logic
        // Fix: Removed 'return params' so global search and filters can work together
        const query = searchValue?.toString().trim();
        if (query) {
            params[searchField] = query;
        } 
        
        // 2. Filter Logic
        if (filterModel?.items && filterModel.items.length > 0) {
            filterModel.items.forEach((item) => {
                const { field, operator, operatorValue, value } = item;
                const activeOperator = operator || operatorValue;
                
                // Skip if no value or if it's a non-filterable field
                if (value === undefined || value === null || value === "" || field === 'total_price') return;

                let formattedValue = value;
                if (value instanceof Date) {
                    formattedValue = value.toISOString().split('T')[0]; 
                } else {
                    formattedValue = value.toString().trim();
                }

                /**
                 * MAP MUI OPERATORS TO DJANGO LOOKUP EXPRESSIONS
                 * We include both camelCase and lowercase versions to ensure MUI 
                 * versions don't break the mapping.
                 */
                const operatorMap = {
                    // String Operators (Matches your FarmerFilter: iexact, icontains, etc.)
                    'contains': '__icontains',
                    'equals': '__iexact',
                    'startsWith': '__istartswith',
                    'startswith': '__istartswith', // lowercase fallback
                    'endsWith': '__iendswith',
                    'endswith': '__iendswith',     // lowercase fallback
                    'is': '__iexact',
                    'not': '__not',

                    // Numeric/Date Operators (Matches StockDetail/Listing: lt, gt, etc.)
                    '=': '__iexact',
                    '!=': '__not',
                    '>': '__gt',
                    '>=': '__gte',
                    '<': '__lt',
                    '<=': '__lte',
                    'isAnyOf': '__in',
                };

                // Apply suffix based on operatorValue, default to __iexact
                const suffix = operatorMap[activeOperator] || '__iexact';
                
                // Construct the backend key (e.g., ekyf_id__istartswith)
                const backendKey = `${field}${suffix}`;
                
                params[backendKey] = formattedValue;
            });
        }

        // 3. Sorting Logic
        if (Array.isArray(sortModel) && sortModel.length > 0) {
            const validSorts = sortModel
                .filter(item => item.field !== 'total_price')
                .map((item) => {
                    const prefix = item.sort === 'desc' ? '-' : '';
                    let orderingField = item.field;
                    
                    // Specific ordering mappings for joined tables
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