import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators, 
    getGridNumericOperators,
    getGridDateOperators
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, MenuItem, IconButton, Typography,
    CircularProgress, InputAdornment, GlobalStyles, Avatar, Stack, Paper, FormHelperText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

// --- OPERATORS & FORMATTERS ---
const stringOperators = getGridStringOperators().filter((op) => 
    ['contains', 'equals', 'startsWith', 'endsWith'].includes(op.value)
);

const numericOperators = getGridNumericOperators().filter((op) => 
    ['=', '>', '>=', '<', '<='].includes(op.value)
);

const dateOperators = getGridDateOperators().filter((op) => 
    ['is', 'not', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(op.value)
);

const formatRegisterTime = (val) => {
    if (!val || val === "") return "-";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "-";
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

function WholesalerStockDetail() {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [stockMasters, setStockMasters] = useState([]);

    // Validation State
    const [formErrors, setFormErrors] = useState({});

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });

    const [formData, setFormData] = useState({
        stock_id: "", 
        quantity: "",
        unit: "kg",
        price_per_unit: "",
        intake_date: new Date().toISOString().split('T')[0],
        expiry_date: "",
        warehouse_loc: ""
    });

    const queryPayload = useMuiDrfQuery({
        paginationModel, 
        sortModel, 
        filterModel,
        searchValue: searchText, 
        searchField: "search", 
        refreshTrigger: refresh
    });

    const loadDependencies = useCallback(async () => {
        try {
            const response = await axiosInstance.get('wholesaler-api/stock-master/');
            setStockMasters(response.data.results || response.data || []);
        } catch (err) { console.error("Dependency Error:", err); }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            let params = { ...queryPayload, deleted: 0 };
            const forbiddenFields = ['total_price', 'wholesaler_photo', 'crop_photo'];
            
            if (params.ordering) {
                const orderField = params.ordering.replace('-', '');
                if (forbiddenFields.includes(orderField)) {
                    delete params.ordering;
                }
            }

            if (searchText) {
                const allowedKeys = ['limit', 'offset', 'search', 'ordering', 'deleted'];
                Object.keys(params).forEach(key => {
                    if (!allowedKeys.includes(key)) delete params[key];
                });
                params.search = searchText;
            }

            const response = await axiosInstance.get('wholesaler-api/stock-detail/', { params });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [queryPayload, searchText]); 

    useEffect(() => { 
        loadData(); 
        loadDependencies(); 
    }, [loadData, loadDependencies]);

    // Validation Logic Based on wholesaler/models.py
    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "stock_id":
                if (!value) error = "Required: Select a Wholesaler and Crop";
                break;
            case "quantity":
                if (!value || value <= 0) error = "Quantity must be greater than 0";
                if (value >= 1000000) error = "Quantity exceeds max limit (8 digits)";
                break;
            case "price_per_unit":
                if (!value || value <= 0) error = "Price must be greater than 0";
                if (value >= 10000000000) error = "Price exceeds max limit (12 digits)";
                break;
            case "expiry_date":
                if (value && formData.intake_date) {
                    if (new Date(value) <= new Date(formData.intake_date)) {
                        error = "Expiry must be after Intake Date";
                    }
                }
                break;
            case "warehouse_loc":
                if (value && value.length > 255) error = "Location cannot exceed 255 characters";
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Immediate Validation
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSave = async () => {
        // Final validation check before submit
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key]);
            if (err) newErrors[key] = err;
        });

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            return; // Stop execution if errors exist
        }

        setSubmitLoading(true);
        try {
            const payload = {
                stock_id: formData.stock_id,
                quantity: formData.quantity,
                unit: formData.unit,
                price_per_unit: formData.price_per_unit,
                intake_date: formData.intake_date,
                expiry_date: formData.expiry_date || null,
                warehouse_loc: formData.warehouse_loc || ""
            };

            if (selectedId) {
                await axiosInstance.patch(`wholesaler-api/stock-detail/${selectedId}/`, payload);
            } else {
                await axiosInstance.post('wholesaler-api/stock-detail/', payload);
            }
            setOpen(false);
            setRefresh(p => p + 1);
            resetForm();
        } catch (err) { 
            if (err.response?.data) {
                // Map backend serializer errors to frontend
                setFormErrors(err.response.data);
            }
        } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Confirm deletion of this record?")) {
            try {
                await axiosInstance.patch(`wholesaler-api/stock-detail/${id}/`, { deleted: true });
                setRefresh(p => p + 1);
            } catch (err) { console.error("Delete Error:", err); }
        }
    };

    const resetForm = () => {
        setFormData({
            stock_id: "", 
            quantity: "", 
            unit: "kg", 
            price_per_unit: "", 
            intake_date: new Date().toISOString().split('T')[0],
            expiry_date: "", 
            warehouse_loc: ""
        });
        setFormErrors({});
        setSelectedId(null);
    };

    const columns = useMemo(() => [
        { field: "id", headerName: "ID", width: 70, type: 'number', filterOperators: numericOperators },
        { field: "wholesaler_name", headerName: "WHOLESALER", width: 160, type: 'string', filterOperators: stringOperators },
        { field: "crop_name", headerName: "CROP", width: 130, type: 'string', filterOperators: stringOperators },
        { 
            field: "quantity", 
            headerName: "QTY", 
            width: 100, 
            type: 'number', 
            filterOperators: numericOperators, 
            renderCell: (p) => `${p.value} ${p.row.unit || 'kg'}` 
        },
        { 
            field: "price_per_unit", 
            headerName: "PRICE", 
            width: 110, 
            type: 'number', 
            filterOperators: numericOperators, 
            renderCell: (p) => <span style={{fontWeight: 700, color: '#1b5e20'}}>₹{p.value}</span> 
        },
        { 
            field: "total_price_display", 
            headerName: "TOTAL VALUE", 
            width: 130, 
            sortable: false,
            filterable: false,
            renderCell: (p) => {
                const total = p.row.quantity * p.row.price_per_unit;
                return <Typography sx={{fontWeight: 700, color: '#2e7d32'}}>₹{(total || 0).toLocaleString()}</Typography>
            }
        },
        { 
            field: "intake_date", 
            headerName: "INTAKE", 
            width: 110, 
            type: 'date', 
            filterOperators: dateOperators,
            valueGetter: (v) => v ? new Date(v) : null,
            renderCell: (p) => formatRegisterTime(p.value)
        },
        { 
            field: "expiry_date", 
            headerName: "EXPIRY DATE", 
            width: 110, 
            type: 'date', 
            filterOperators: dateOperators,
            valueGetter: (v) => v ? new Date(v) : null,
            renderCell: (p) => (
                <Typography sx={{ 
                    fontSize: '0.875rem', 
                    color: p.value && new Date(p.value) < new Date() ? '#d32f2f' : 'inherit',
                    fontWeight: p.value && new Date(p.value) < new Date() ? 700 : 400
                }}>
                    {formatRegisterTime(p.value)}
                </Typography>
            )
        },
        { field: "warehouse_loc", headerName: "LOCATION", width: 150, type: 'string', filterOperators: stringOperators },
        {
            field: "actions", headerName: "ACTIONS", width: 100, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        setSelectedId(params.row.id);
                        setFormData({ ...params.row, stock_id: params.row.stock_id });
                        setOpen(true);
                    }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], []); 

    return (
        <Box sx={styles.container} className="print-area">
            <GlobalStyles styles={printStyles} />
            <Box sx={styles.header}>
                <Typography variant="h5" sx={styles.title}>WHOLESALE STOCK INVENTORY</Typography>
                <Box sx={styles.headerActions} className="no-print">
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT REPORT</Button>
                    <TextField 
                        size="small" 
                        placeholder="Search Inventory..." 
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        sx={styles.searchField}
                        InputProps={{ 
                            startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                            endAdornment: searchText && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchText("")}><ClearIcon fontSize="small" /></IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpen(true); }} sx={styles.addButton}>REGISTER NEW STOCK</Button>
                </Box>
            </Box>

            <Paper sx={styles.gridBox}>
                <DataGrid
                    rows={rows} columns={columns} loading={loading}
                    rowCount={rowCount} paginationMode="server" sortingMode="server" filterMode="server"
                    paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel} onFilterModelChange={setFilterModel}
                    autoHeight sx={styles.dataGrid} pageSizeOptions={[10, 25, 50, 100]}
                />
            </Paper>

            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="lg" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT WHOLESALE STOCK" : "NEW STOCK REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                select fullWidth label="Wholesaler / His Crop *" size="small" 
                                disabled={!!selectedId} name="stock_id" value={formData.stock_id} 
                                onChange={handleInputChange}
                                error={!!formErrors.stock_id}
                                helperText={formErrors.stock_id}
                                sx={styles.selectInput}
                            >
                                {stockMasters.map(m => (
                                    <MenuItem key={m.stock_id} value={m.stock_id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2" sx={{fontWeight: 700}}>{m.wholesaler_name}</Typography>
                                            <Typography variant="caption" sx={{mx: 1, color: 'text.secondary'}}>|</Typography>
                                            <Typography variant="body2">{m.crop_name}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                            <TextField 
                                fullWidth type="number" name="quantity" label="Quantity *" size="small" 
                                value={formData.quantity} onChange={handleInputChange}
                                error={!!formErrors.quantity}
                                helperText={formErrors.quantity}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField select fullWidth name="unit" label="Unit *" size="small" value={formData.unit} onChange={handleInputChange}>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="TON">TON</MenuItem>
                                <MenuItem value="Q">Q</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth type="number" name="price_per_unit" label="Price per Unit *" size="small" 
                                value={formData.price_per_unit} onChange={handleInputChange} 
                                error={!!formErrors.price_per_unit}
                                helperText={formErrors.price_per_unit}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth type="date" name="intake_date" label="Intake Date" size="small" 
                                InputLabelProps={{ shrink: true }} value={formData.intake_date} onChange={handleInputChange} 
                                error={!!formErrors.intake_date}
                                helperText={formErrors.intake_date}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth type="date" name="expiry_date" label="Expiry Date" size="small" 
                                InputLabelProps={{ shrink: true }} value={formData.expiry_date || ""} onChange={handleInputChange} 
                                error={!!formErrors.expiry_date}
                                helperText={formErrors.expiry_date}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={12}>
                            <TextField 
                                fullWidth name="warehouse_loc" label="Warehouse Location" size="small" 
                                value={formData.warehouse_loc || ""} onChange={handleInputChange} 
                                error={!!formErrors.warehouse_loc}
                                helperText={formErrors.warehouse_loc}
                            />
                        </Grid>
                        
                        {formData.quantity && formData.price_per_unit && (
                            <Grid item xs={12}>
                                <Box sx={styles.totalBox}>
                                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Inventory Valuation</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(formData.quantity * formData.price_per_unit).toLocaleString()}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>CANCEL</Button>
                    <Button variant="contained" onClick={handleSave} sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "PROCESS ENTRY"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// --- CLEAN CONST STYLE CSS ---
const styles = {
    container: { padding: "40px", backgroundColor: "#ffffff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    headerActions: { display: "flex", gap: "12px", alignItems: "center" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px", textTransform: "uppercase" },
    searchField: { width: "350px", backgroundColor: "#f9f9f9", "& .MuiInputBase-root": { height: "40px" } },
    printBtn: { color: "#2e7d32", fontWeight: "900", border: "1.5px solid #2e7d32", height: "40px", px: 3 },
    addButton: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "800", height: "40px", px: 4 },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "4px" },
    dataGrid: { border: "none", "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" } },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1976d2", "&:hover": { backgroundColor: "#e3f2fd" } },
    deleteBtn: { color: "#d32f2f", "&:hover": { backgroundColor: "#ffebee" } },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "center" },
    selectInput: { minWidth: "160px" },
    totalBox: { p: 2, backgroundColor: "#e8f5e9", borderRadius: "4px", textAlign: "right", color: "#1b5e20", border: "1px dashed #2e7d32" },
    dialogActions: { padding: "24px", justifyContent: "flex-end", gap: "12px" },
    saveBtn: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", minWidth: "180px" }
};

const printStyles = {
    "@media print": {
        "body *": { visibility: "hidden" },
        ".print-area, .print-area *": { visibility: "visible" },
        ".print-area": { position: "absolute", left: 0, top: 0, width: "100%" },
        ".no-print": { display: "none !important" }
    }
};

export default WholesalerStockDetail;