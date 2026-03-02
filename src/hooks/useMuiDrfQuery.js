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

        const query = searchValue?.toString().trim();

        
        if (query) {
            params[searchField] = query;
            return params; 
        } 
        
        
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
                
                const strictFields = ['farmer_name', 'crop_name', 'wholesaler_name'];

                if (strictFields.includes(field)) {

                    params[field] = formattedValue;
                } else {
                    
                    params[`${field}${suffix}`] = formattedValue;
                }
            });
        }

        
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