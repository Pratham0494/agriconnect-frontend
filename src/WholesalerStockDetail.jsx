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
    CircularProgress, InputAdornment, GlobalStyles, Avatar, Stack, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

/* --- Strict Operator Definitions --- */
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

/* --- Secure Image Component --- */
const AuthorizedAvatar = ({ path, name, variant = "rounded", size = 44 }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!path || typeof path !== 'string' || path.trim() === "") {
            setImgSrc(null);
            return;
        }

        const fetchSecureImage = async () => {
            setFetching(true);
            try {
                const response = await axiosInstance.get(path, { responseType: 'blob' });
                const objectUrl = URL.createObjectURL(response.data);
                setImgSrc(objectUrl);
            } catch (err) { 
                console.error("Image Error:", err); 
                setImgSrc(null);
            } finally { 
                setFetching(false); 
            }
        };

        fetchSecureImage();
        return () => { 
            if (imgSrc && imgSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imgSrc);
            }
        };
    }, [path]);

    return (
        <Avatar src={imgSrc} variant={variant} sx={{ width: size, height: size, fontSize: '0.8rem', borderRadius: variant === "rounded" ? "4px" : "50%", backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            {fetching ? <CircularProgress size={16} color="inherit" /> : name?.charAt(0)}
        </Avatar>
    );
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

    const [wholesalers, setWholesalers] = useState([]);
    const [crops, setCrops] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });

    /* --- Logic: Global Search via 'search' parameter --- */
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
            const [wRes, cRes] = await Promise.all([
                axiosInstance.get('wholesaler-api/wholesaler/'),
                axiosInstance.get('admin-api/crop/')
            ]);
            setWholesalers(wRes.data.results || wRes.data || []);
            setCrops(cRes.data.results || cRes.data || []);
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
                    if (!allowedKeys.includes(key)) {
                        delete params[key];
                    }
                });
                params.search = searchText;
            }

            const response = await axiosInstance.get('wholesaler-api/stock-detail/', { 
                params: params 
            });
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

    const [formData, setFormData] = useState({
        wholesaler_id: "",
        crop_id: "",
        items: [{
            batch_number: "",
            quantity: "",
            unit: "kg",
            price_per_unit: "",
            expiry_date: "",
            stored_location: ""
        }]
    });

    const handleItemChange = (field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[0][field] = value;
        setFormData({ ...formData, items: updatedItems });
    };

    const handleSave = async () => {
        setSubmitLoading(true);
        try {
            const cleanItem = {
                batch_number: formData.items[0].batch_number || "",
                quantity: formData.items[0].quantity,
                unit: formData.items[0].unit, 
                price_per_unit: formData.items[0].price_per_unit,
                expiry_date: formData.items[0].expiry_date || null,
                warehouse_loc: formData.items[0].stored_location || ""
            };

            if (selectedId) {
                await axiosInstance.patch(`wholesaler-api/stock-detail/${selectedId}/`, cleanItem);
            } else {
                const masterPayload = {
                    w_id: formData.wholesaler_id,
                    crop_id: formData.crop_id,
                    items: [cleanItem]
                };
                await axiosInstance.post('wholesaler-api/stock-master/', masterPayload);
            }
            setOpen(false);
            setRefresh(p => p + 1);
            resetForm();
        } catch (err) { 
            console.error("Save Error:", err.response?.data);
        } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.patch(`wholesaler-api/stock-detail/${id}/`, { deleted: true });
            setRefresh(p => p + 1);
        } catch (err) { console.error("Delete Error:", err); }
    };

    const resetForm = () => {
        setFormData({
            wholesaler_id: "", crop_id: "",
            items: [{ batch_number: "", quantity: "", unit: "kg", price_per_unit: "", expiry_date: "", stored_location: "" }]
        });
        setSelectedId(null);
    };

    const columns = useMemo(() => [
        { field: "id", headerName: "ID", width: 80, type: 'number', filterOperators: numericOperators },
        { 
            field: "wholesaler_photo", 
            headerName: "WHOLESALER", 
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (p) => {
                const wData = wholesalers.find(w => w.first_name === p.row.wholesaler_name);
                return (
                    <Box sx={styles.cellCenter}>
                        <AuthorizedAvatar path={wData?.w_photo} name={p.row?.wholesaler_name} variant="circular" size={40} />
                    </Box>
                );
            }
        },
        { 
            field: "crop_photo", 
            headerName: "CROP PHOTO", 
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (p) => {
                const cropData = crops.find(c => 
                    c.crop_name && p.row.crop_name &&
                    c.crop_name.toLowerCase() === p.row.crop_name.toLowerCase()
                );
                return (
                    <Box sx={styles.cellCenter}>
                        <AuthorizedAvatar path={cropData?.photo} name={p.row?.crop_name} variant="rounded" size={40} />
                    </Box>
                );
            }
        },
        { field: "wholesaler_name", headerName: "BUSINESS", width: 200, type: 'string', filterOperators: stringOperators },
        { field: "crop_name", headerName: "CROP", width: 180, type: 'string', filterOperators: stringOperators },
        { 
            field: "quantity", 
            headerName: "QTY", 
            width: 120, 
            type: 'number', 
            filterOperators: numericOperators, 
            renderCell: (p) => `${p.value} ${p.row.unit || 'kg'}` 
        },
        { 
            field: "price_per_unit", 
            headerName: "PRICE", 
            width: 130, 
            type: 'number', 
            filterOperators: numericOperators, 
            renderCell: (p) => <span style={{fontWeight: 700, color: '#1b5e20'}}>₹{p.value}</span> 
        },
        { 
            field: "total_price_display", 
            headerName: "TOTAL VALUE", 
            width: 140, 
            sortable: false,
            filterable: false,
            renderCell: (p) => {
                const total = p.row.quantity * p.row.price_per_unit;
                return <Typography sx={{fontWeight: 700, color: '#2e7d32'}}>₹{(total || 0).toLocaleString()}</Typography>
            }
        },
        {
            field: "actions", headerName: "ACTIONS", width: 110, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox}>
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        const wData = wholesalers.find(w => w.first_name === params.row.wholesaler_name);
                        const cData = crops.find(c => c.crop_name === params.row.crop_name);
                        setSelectedId(params.row.id);
                        setFormData({ 
                            wholesaler_id: wData?.w_id || "", 
                            crop_id: cData?.crop_id || "",
                            items: [{ ...params.row, stored_location: params.row.warehouse_loc }] 
                        });
                        setOpen(true);
                    }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], [wholesalers, crops]); 

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
                                    <IconButton size="small" onClick={() => setSearchText("")}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
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
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT WHOLESALE STOCK" : "NEW WHOLESALE REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                select fullWidth label="Wholesaler *" size="small" 
                                disabled={!!selectedId} value={formData.wholesaler_id} 
                                onChange={(e) => setFormData({...formData, wholesaler_id: e.target.value})}
                                sx={styles.selectInput}
                            >
                                {wholesalers.map(w => (
                                    <MenuItem key={w.w_id} value={w.w_id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AuthorizedAvatar path={w.w_photo} name={w.first_name} size={22} variant="circular" />
                                            <Typography variant="body2">{w.business_name} ({w.first_name})</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                select fullWidth label="Crops *" size="small" 
                                disabled={!!selectedId} value={formData.crop_id} 
                                onChange={(e) => setFormData({...formData, crop_id: e.target.value})}
                                sx={styles.selectInput}
                            >
                                {crops.map(c => (
                                    <MenuItem key={c.crop_id} value={c.crop_id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AuthorizedAvatar path={c.photo} name={c.crop_name} size={22} variant="rounded" />
                                            <Typography variant="body2">{c.crop_name}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12} md={3}><TextField fullWidth label="Batch Number *" size="small" value={formData.items[0].batch_number} onChange={(e) => handleItemChange("batch_number", e.target.value)} /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Quantity *" size="small" value={formData.items[0].quantity} onChange={(e) => handleItemChange("quantity", e.target.value)} /></Grid>
                        
                        <Grid item xs={12} md={3}>
                            <TextField select fullWidth label="Unit *" size="small" value={formData.items[0].unit} onChange={(e) => handleItemChange("unit", e.target.value)}>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="TON">TON</MenuItem>
                                <MenuItem value="Q">Q</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Price per Unit *" size="small" value={formData.items[0].price_per_unit} onChange={(e) => handleItemChange("price_per_unit", e.target.value)} /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Expiry Date" size="small" InputLabelProps={{ shrink: true }} value={formData.items[0].expiry_date || ""} onChange={(e) => handleItemChange("expiry_date", e.target.value)} /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth label="Storage Location" size="small" value={formData.items[0].stored_location || ""} onChange={(e) => handleItemChange("stored_location", e.target.value)} /></Grid>
                        
                        {formData.items[0].quantity && formData.items[0].price_per_unit && (
                            <Grid item xs={12}>
                                <Box sx={styles.totalBox}>
                                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Inventory Valuation</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(formData.items[0].quantity * formData.items[0].price_per_unit).toLocaleString()}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>CANCEL</Button>
                    <Button variant="contained" onClick={handleSave} sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "SAVE WHOLESALE DATA"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

/* --- Clean Const Style CSS --- */
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
    cellCenter: { display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center' },
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