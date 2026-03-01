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
    cellCenter: { display: 'flex', justifyContent: 'center', width: '100%' },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1976d2", "&:hover": { backgroundColor: "#e3f2fd" } },
    deleteBtn: { color: "#d32f2f", "&:hover": { backgroundColor: "#ffebee" } },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "center" },
    selectInput: { minWidth: "160px" },
    totalBox: { p: 2, backgroundColor: "#e8f5e9", borderRadius: "4px", textAlign: "right", color: "#1b5e20", border: "1px dashed #2e7d32" },
    dialogActions: { padding: "24px", justifyContent: "flex-end", gap: "12px" },
    saveBtn: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", minWidth: "180px" }
};

// --- AGGRESSIVE PRINT CONFIGURATION ---
const printStyles = {
    "@media print": {
        "@page": { size: "A4 landscape", margin: "5mm" },
        "body *": { visibility: "hidden" },
        ".print-root, .print-root *": { visibility: "visible" },
        ".print-root": { position: "absolute", left: 0, top: 0, width: "100%", padding: 0 },
        ".no-print": { display: "none !important" },
        ".printable-content": { width: "100%", boxShadow: "none !important" },
        "aside, nav, header, .MuiDrawer-root, .MuiAppBar-root": { display: "none !important" },
        ".MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5 !important" },
        ".MuiDataGrid-footerContainer": { display: "none !important" }
    }
};

const STRICT_STRING_OPS = getGridStringOperators().filter((op) => 
    ['equals'].includes(op.value)
);

const BACKEND_STRING_OPS = getGridStringOperators().filter((op) => 
    ['contains', 'equals', 'startsWith', 'endsWith'].includes(op.value)
);

const BACKEND_NUMERIC_OPS = getGridNumericOperators().filter((op) => 
    ['=', '>', '>=', '<', '<='].includes(op.value)
);

const BACKEND_DATE_OPS = getGridDateOperators().filter((op) => 
    ['is', 'after', 'before'].includes(op.value)
);

const formatRegisterTime = (val) => {
    if (!val) return "-";
    const date = (val instanceof Date) ? val : new Date(val);
    return isNaN(date.getTime()) ? "-" : `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

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
            } catch (err) { setImgSrc(null); } 
            finally { setFetching(false); }
        };
        fetchSecureImage();
        return () => { if (imgSrc) URL.revokeObjectURL(imgSrc); };
    }, [path]);

    return (
        <Avatar src={imgSrc} variant={variant} sx={{ width: size, height: size, fontSize: '0.8rem', borderRadius: variant === "rounded" ? "4px" : "50%" }}>
            {fetching ? <CircularProgress size={16} color="inherit" /> : name?.charAt(0)}
        </Avatar>
    );
};

function StockList() {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [crops, setCrops] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });

    const queryPayload = useMuiDrfQuery({
        paginationModel, 
        sortModel, 
        filterModel: searchText.trim() !== "" ? { items: [] } : filterModel,
        searchValue: searchText, 
        searchField: "search", 
        refreshTrigger: refresh
    });

    const loadDependencies = useCallback(async () => {
        try {
            const [fRes, cRes] = await Promise.all([
                axiosInstance.get('farmer-api/farmer/'),
                axiosInstance.get('admin-api/crop/')
            ]);
            setFarmers(fRes.data.results || fRes.data || []);
            setCrops(cRes.data.results || cRes.data || []);
        } catch (err) { console.error("Dependency Error:", err); }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('farmer-api/stock-detail/', { params: queryPayload });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { console.error("Fetch Error:", err); }
        finally { setLoading(false); }
    }, [queryPayload]);

    useEffect(() => { loadData(); loadDependencies(); }, [loadData, loadDependencies]);

    const [formData, setFormData] = useState({
        farmer_id: "",
        crop_id: "",
        items: [{
            harvested_date: new Date().toISOString().split('T')[0],
            hectares: "",
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
                harvested_date: formData.items[0].harvested_date,
                hectares: formData.items[0].hectares || null,
                quantity: formData.items[0].quantity,
                unit: formData.items[0].unit, 
                price_per_unit: formData.items[0].price_per_unit,
                expiry_date: formData.items[0].expiry_date || null,
                stored_location: formData.items[0].stored_location || ""
            };

            if (selectedId) {
                await axiosInstance.patch(`farmer-api/stock-detail/${selectedId}/`, cleanItem);
            } else {
                const masterPayload = {
                    farmer_id: formData.farmer_id,
                    crop_id: formData.crop_id,
                    items: [cleanItem]
                };
                await axiosInstance.post('farmer-api/stock-master/', masterPayload);
            }
            setOpen(false);
            setRefresh(p => p + 1);
            resetForm();
        } catch (err) { 
            console.error("Save Error:", err.response?.data);
        } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this stock detail?")) {
            try {
                await axiosInstance.patch(`farmer-api/stock-detail/${id}/`, { deleted: true });
                setRefresh(p => p + 1);
            } catch (err) { console.error("Delete Error:", err); }
        }
    };

    const resetForm = () => {
        setFormData({
            farmer_id: "", crop_id: "",
            items: [{ harvested_date: new Date().toISOString().split('T')[0], hectares: "", quantity: "", unit: "kg", price_per_unit: "", expiry_date: "", stored_location: "" }]
        });
        setSelectedId(null);
    };

    const columns = useMemo(() => [
        { field: "id", headerName: "ID", width: 80, type: "number", filterOperators: BACKEND_NUMERIC_OPS },
        { 
            field: "farmer_photo", 
            headerName: "FARMER PHOTO", 
            width: 120, 
            sortable: false, 
            filterable: false,
            renderCell: (p) => {
                const farmerData = farmers.find(f => f.first_name?.toLowerCase() === p.row.farmer_name?.toLowerCase());
                return (
                    <Box sx={styles.cellCenter}>
                        <AuthorizedAvatar path={farmerData?.f_photo} name={p.row?.farmer_name} variant="circular" size={40} />
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
                const cropData = crops.find(c => c.crop_name?.toLowerCase() === p.row.crop_name?.toLowerCase());
                return (
                    <Box sx={styles.cellCenter}>
                        <AuthorizedAvatar path={cropData?.photo} name={p.row?.crop_name} variant="rounded" size={40} />
                    </Box>
                );
            }
        },
        { field: "farmer_name", headerName: "FARMER", width: 160, type: "string", filterOperators: STRICT_STRING_OPS },
        { field: "crop_name", headerName: "CROP", width: 140, type: "string", filterOperators: STRICT_STRING_OPS },
        { field: "quantity", headerName: "QTY", width: 100, type: 'number', filterOperators: BACKEND_NUMERIC_OPS, renderCell: (p) => `${p.value} ${p.row.unit}` },
        { field: "price_per_unit", headerName: "PRICE", width: 110, type: 'number', filterOperators: BACKEND_NUMERIC_OPS, renderCell: (p) => `₹${p.value}` },
        { field: "total_price", headerName: "TOTAL VALUE", width: 130, type: 'number', filterable: false, renderCell: (p) => <strong>₹{p.value}</strong> },
        { field: "hectares", headerName: "HECTARES", width: 100, type: 'number', filterOperators: BACKEND_NUMERIC_OPS },
        { field: "stored_location", headerName: "STORAGE", width: 150, type: "string", filterOperators: BACKEND_STRING_OPS },
        { 
            field: "harvested_date", 
            headerName: "HARVEST DATE", 
            width: 130,
            type: 'date',
            filterOperators: BACKEND_DATE_OPS,
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => formatRegisterTime(params.value) 
        },
        {
            field: "expiry_date",
            headerName: "EXPIRY DATE",
            width: 130,
            type: 'date',
            filterOperators: BACKEND_DATE_OPS,
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => formatRegisterTime(params.value)
        },
        {
            field: "actions", headerName: "ACTIONS", width: 110, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        const fData = farmers.find(f => f.first_name === params.row.farmer_name);
                        const cData = crops.find(c => c.crop_name === params.row.crop_name);
                        setSelectedId(params.row.id);
                        setFormData({ 
                            farmer_id: fData?.f_id || "", 
                            crop_id: cData?.crop_id || "",
                            items: [{ ...params.row }] 
                        });
                        setOpen(true);
                    }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], [farmers, crops]); 

    return (
        <Box sx={styles.container} className="print-root">
            <GlobalStyles styles={printStyles} />
            <Box sx={styles.header}>
                <Typography variant="h5" sx={styles.title}>STOCK MANAGEMENT INVENTORY</Typography>
                <Box sx={styles.headerActions} className="no-print">
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT REPORT</Button>
                    <TextField 
                        size="small" placeholder="Global Search..." value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
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

            <Paper sx={styles.gridBox} className="printable-content">
                <DataGrid
                    rows={rows} columns={columns} loading={loading}
                    rowCount={rowCount} paginationMode="server" sortingMode="server" filterMode="server"
                    paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel} onFilterModelChange={setFilterModel}
                    autoHeight sx={styles.dataGrid} pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Paper>

            {/* MODALS HIDE AUTOMATICALLY DURING PRINT VIA .no-print CLASS */}
            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="lg" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT STOCK ENTRY" : "NEW STOCK REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={3}>
                            <TextField 
                                select fullWidth label="Farmers *" size="small" 
                                disabled={!!selectedId} value={formData.farmer_id} 
                                onChange={(e) => setFormData({...formData, farmer_id: e.target.value})}
                                sx={styles.selectInput}
                            >
                                {farmers.map(f => (
                                    <MenuItem key={f.f_id} value={f.f_id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AuthorizedAvatar path={f.f_photo} name={f.first_name} size={22} variant="circular" />
                                            <Typography variant="body2">{f.first_name}</Typography>
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
                        <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Quantity *" size="small" value={formData.items[0].quantity} onChange={(e) => handleItemChange("quantity", e.target.value)} /></Grid>
                        <Grid item xs={12} md={2}>
                            <TextField select fullWidth label="Unit *" size="small" value={formData.items[0].unit} onChange={(e) => handleItemChange("unit", e.target.value)}>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="TON">TON</MenuItem>
                                <MenuItem value="Q">Q</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Price per Unit *" size="small" value={formData.items[0].price_per_unit} onChange={(e) => handleItemChange("price_per_unit", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Hectares (Land Area)" size="small" value={formData.items[0].hectares} onChange={(e) => handleItemChange("hectares", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Harvest Date" size="small" InputLabelProps={{ shrink: true }} value={formData.items[0].harvested_date} onChange={(e) => handleItemChange("harvested_date", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Expiry Date" size="small" InputLabelProps={{ shrink: true }} value={formData.items[0].expiry_date || ""} onChange={(e) => handleItemChange("expiry_date", e.target.value)} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Storage/Warehouse Location" size="small" value={formData.items[0].stored_location || ""} onChange={(e) => handleItemChange("stored_location", e.target.value)} /></Grid>
                        {formData.items[0].quantity && formData.items[0].price_per_unit && (
                            <Grid item xs={12}>
                                <Box sx={styles.totalBox}>
                                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Calculated Total Value</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{formData.items[0].quantity * formData.items[0].price_per_unit}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>CANCEL</Button>
                    <Button variant="contained" onClick={handleSave} sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "SAVE STOCK DATA"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default StockList;