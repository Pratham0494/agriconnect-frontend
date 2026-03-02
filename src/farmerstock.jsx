import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators, 
    getGridNumericOperators,
    getGridDateOperators
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, MenuItem, IconButton, Typography, Select,
    FormControl, InputLabel, Avatar, CircularProgress, InputAdornment,
    GlobalStyles, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormHelperText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

const AuthorizedAvatar = ({ path, name, variant = "circular", size = 32 }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!path) { setImgSrc(null); return; }
        const fetchSecureImage = async () => {
            setFetching(true);
            try {
                const fullPath = path.startsWith('http') ? path : `/media/${path}`;
                const response = await axiosInstance.get(fullPath, { responseType: 'blob' });
                const objectUrl = URL.createObjectURL(response.data);
                setImgSrc(objectUrl);
            } catch (err) {
                setImgSrc(null);
            } finally { setFetching(false); }
        };
        fetchSecureImage();
        return () => { if (imgSrc) URL.revokeObjectURL(imgSrc); };
    }, [path]);

    return (
        <Avatar src={imgSrc} variant={variant} sx={{ width: size, height: size, fontSize: '0.7rem', bgcolor: '#e8f5e9', color: '#1b5e20' }}>
            {fetching ? <CircularProgress size={12} color="inherit" /> : name?.charAt(0).toUpperCase()}
        </Avatar>
    );
};

const backendStringOperators = [
    ...getGridStringOperators().filter((op) => 
        ['contains', 'equals', 'startsWith'].includes(op.value)
    ),
    {
        label: 'ends with',
        value: 'endsWith',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) return null;
            return ({ value }) => value && value.endsWith(filterItem.value);
        },
    }
];

const backendNumericOperators = getGridNumericOperators().filter((op) => 
    ['=', '>', '>=', '<', '<='].includes(op.value)
);

const backendDateOperators = getGridDateOperators().filter((op) =>
    ['is', 'not', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(op.value)
);

const formatTime = (val) => {
    if (!val || val === "-") return "-";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const FarmerStock = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [farmers, setFarmers] = useState([]);
    const [crops, setCrops] = useState([]);

    // Validation State
    const [errors, setErrors] = useState({});

    const [masterSelection, setMasterSelection] = useState({ farmer_id: "", crop_id: "" });

    const [formRows, setFormRows] = useState([
        { 
            unit: "kg", 
            hectares: "", 
            quantity: "", 
            price_per_unit: "", 
            stored_location: "",
            harvested_date: new Date().toISOString().split('T')[0],
            expiry_date: ""
        }
    ]);

    const [editData, setEditData] = useState({ stock_id: null, farmer_id: "", crop_id: "" });

    const processedFilterModel = useMemo(() => {
        const newItems = [];
        let searchOverride = "";
        filterModel.items.forEach((item) => {
            if (item.field === "crop_name" || item.field === "farmer_name") {
                if (item.value) searchOverride = item.value;
            } else {
                newItems.push(item);
            }
        });
        return { items: newItems, searchOverride };
    }, [filterModel]);

    const effectiveFilterModel = useMemo(() => {
        if (searchText.trim() !== "") return { items: [] }; 
        return { items: processedFilterModel.items };
    }, [processedFilterModel, searchText]);

    const queryPayload = useMuiDrfQuery({
        paginationModel, 
        sortModel, 
        filterModel: effectiveFilterModel,
        searchValue: searchText || processedFilterModel.searchOverride, 
        searchField: "search", 
        refreshTrigger: refresh
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/farmer-api/stock-master/', { params: queryPayload });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [queryPayload]);

    const loadOptions = async () => {
        try {
            const [fRes, cRes] = await Promise.all([
                axiosInstance.get('/farmer-api/farmer/?limit=1000'),
                axiosInstance.get('/admin-api/crop/?limit=1000')
            ]);
            setFarmers(fRes.data.results || []);
            setCrops(cRes.data.results || []);
        } catch (err) { console.error("Error loading options:", err); }
    };

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadOptions(); }, []);

    const handleAddRow = () => {
        setFormRows([...formRows, { 
            unit: "kg", hectares: "", quantity: "", price_per_unit: "", stored_location: "",
            harvested_date: new Date().toISOString().split('T')[0],
            expiry_date: ""
        }]);
    };

    const handleRemoveRow = (index) => {
        if (formRows.length > 1) {
            setFormRows(formRows.filter((_, i) => i !== index));
            // Also clean up errors for that row if they exist
            const newErrors = { ...errors };
            delete newErrors[`row_${index}`];
            setErrors(newErrors);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...formRows];
        updatedRows[index][field] = value;
        setFormRows(updatedRows);
        // Clear error when user types
        if (errors[`row_${index}`]?.[field]) {
            const newErrors = { ...errors };
            delete newErrors[`row_${index}`][field];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!masterSelection.farmer_id) tempErrors.farmer_id = "Farmer selection is required.";
        if (!masterSelection.crop_id) tempErrors.crop_id = "Crop selection is required.";

        formRows.forEach((row, index) => {
            let rowErrors = {};
            if (!row.harvested_date) rowErrors.harvested_date = "Required";
            if (!row.quantity || parseFloat(row.quantity) <= 0) rowErrors.quantity = "Invalid Qty";
            if (!row.price_per_unit || parseFloat(row.price_per_unit) <= 0) rowErrors.price_per_unit = "Invalid Price";
            
            if (row.expiry_date && row.expiry_date < row.harvested_date) {
                rowErrors.expiry_date = "After Harvest Only";
            }

            if (Object.keys(rowErrors).length > 0) {
                tempErrors[`row_${index}`] = rowErrors;
            }
        });

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmitRegistration = async () => {
        if (!validateForm()) return;
        setSubmitLoading(true);
        try {
            const payload = {
                farmer_id: masterSelection.farmer_id,
                crop_id: masterSelection.crop_id,
                items: formRows.map(row => ({
                    harvested_date: row.harvested_date,
                    hectares: row.hectares || 0,
                    quantity: row.quantity,
                    unit: row.unit,
                    price_per_unit: row.price_per_unit,
                    stored_location: row.stored_location,
                    expiry_date: row.expiry_date || null
                }))
            };
            await axiosInstance.post('/farmer-api/stock-master/', payload);
            setOpen(false);
            setRefresh(p => p + 1);
            setMasterSelection({ farmer_id: "", crop_id: "" });
            setFormRows([{ unit: "kg", hectares: "", quantity: "", price_per_unit: "", stored_location: "", harvested_date: new Date().toISOString().split('T')[0], expiry_date: "" }]);
            setErrors({});
        } catch (err) { 
            if (err.response?.data) setErrors(err.response.data);
            console.error("Submission Error:", err.response?.data); 
        } finally { setSubmitLoading(false); }
    };

    const handleEditClick = (row) => {
        setEditData({ stock_id: row.stock_id, farmer_id: row.farmer_id, crop_id: row.crop_id });
        setEditOpen(true);
    };

    const handleUpdateMaster = async () => {
        setSubmitLoading(true);
        try {
            await axiosInstance.patch(`/farmer-api/stock-master/${editData.stock_id}/`, {
                farmer_id: editData.farmer_id,
                crop_id: editData.crop_id
            });
            setEditOpen(false);
            setRefresh(p => p + 1);
        } catch (err) { console.error(err); } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axiosInstance.patch(`/farmer-api/stock-master/${id}/`, {
                    deleted: true
                });
                setRefresh(p => p + 1);
            } catch (err) { 
                console.error("Delete error:", err); 
            }
        }
    };

    const columns = useMemo(() => [
        { 
            field: "stock_id", 
            headerName: "ID", 
            width: 100, 
            type: 'number',
            filterOperators: backendNumericOperators 
        },
        { 
            field: "farmer_name", 
            headerName: "FARMER (NAME / ID)", 
            flex: 1.5, 
            filterOperators: backendStringOperators,
            renderCell: (p) => {
                const name = p.row.farmer_name || "Unknown";
                const farmerData = farmers.find(f => (f.f_id || f.id) === p.row.farmer_id);
                const photoPath = farmerData ? (farmerData.f_photo || farmerData.photo) : null;
                return (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <AuthorizedAvatar path={photoPath} name={name} size={32} />
                        <Typography sx={{ fontWeight: "700", fontSize: "13px" }}>
                            {name} / {p.row.farmer_id}
                        </Typography>
                    </Stack>
                );
            }
        },
        { 
            field: "crop_name", 
            headerName: "CROP (NAME / ID)", 
            flex: 1, 
            filterOperators: backendStringOperators,
            renderCell: (p) => {
                const name = p.value || "UNKNOWN";
                const cropData = crops.find(c => (c.crop_id || c.c_id) === p.row.crop_id);
                const photoPath = cropData ? (cropData.photo || cropData.crop_image || cropData.image) : null;
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <AuthorizedAvatar path={photoPath} name={name} size={32} variant="rounded" />
                        <Box sx={styles.badge}>{name.toUpperCase()} / {p.row.crop_id}</Box>
                    </Stack>
                );
            }
        },
        { 
            field: "created_at", 
            headerName: "REGISTERED DATE", 
            width: 180,
            type: 'date',
            filterOperators: backendDateOperators,
            valueGetter: (params) => params.value ? new Date(params.value) : null,
            renderCell: (p) => (
                <Typography sx={{ fontSize: '13px', fontWeight: '500' }}>
                    {formatTime(p.row.created_at)}
                </Typography>
            )
        },
        {
            field: "actions", headerName: "ACTIONS", width: 140, sortable: false, filterable: false,
            renderCell: (p) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton sx={styles.editBtn} onClick={() => handleEditClick(p.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(p.row.stock_id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], [farmers, crops]);

    return (
        <Box sx={styles.container} className="print-root">
            <GlobalStyles styles={printStyles} />

            <Box sx={styles.header} className="no-print">
                <Typography variant="h5" sx={styles.title}>STOCK MASTER CONTROL</Typography>
                <Box sx={styles.headerActions}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT</Button>
                    <TextField 
                        size="small" placeholder="Search Master..." value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={styles.searchField}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={styles.addButton}>REGISTER STOCK</Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox} className="printable-content">
                <DataGrid
                    rows={rows} columns={columns} getRowId={(r) => r.stock_id}
                    paginationMode="server" sortingMode="server" filterMode="server"
                    rowCount={rowCount} paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel} 
                    onSortModelChange={setSortModel}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    loading={loading} autoHeight sx={styles.dataGrid}
                    disableRowSelectionOnClick
                />
            </Box>

            {/* REGISTER MODAL */}
            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="xl" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>NEW STOCK REGISTRATION</DialogTitle>
                <DialogContent dividers>
                    <Box sx={styles.selectionHeaderArea}>
                        <Box sx={styles.selectionBox}>
                            <Typography sx={styles.selectionLabel}>FARMER SELECTION</Typography>
                            <FormControl fullWidth size="small" error={!!errors.farmer_id}>
                                <Select 
                                    value={masterSelection.farmer_id} 
                                    onChange={(e) => setMasterSelection({...masterSelection, farmer_id: e.target.value})}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) return <span style={{color: '#aaa'}}>Select Farmer...</span>;
                                        const farmer = farmers.find(f => (f.f_id || f.id) === selected);
                                        return farmer ? `${farmer.first_name || farmer.user_name} / ${farmer.f_id || farmer.id}` : "";
                                    }}
                                >
                                    {farmers.map(f => (
                                        <MenuItem key={f.f_id || f.id} value={f.f_id || f.id}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <AuthorizedAvatar path={f.f_photo || f.photo} name={f.first_name || f.user_name} size={30} />
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.first_name || f.user_name} / {f.f_id || f.id}</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.farmer_id && <FormHelperText>{errors.farmer_id}</FormHelperText>}
                            </FormControl>
                        </Box>

                        <Box sx={styles.selectionBox}>
                            <Typography sx={styles.selectionLabel}>CROP SELECTION</Typography>
                            <FormControl fullWidth size="small" error={!!errors.crop_id}>
                                <Select 
                                    value={masterSelection.crop_id} 
                                    onChange={(e) => setMasterSelection({...masterSelection, crop_id: e.target.value})}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) return <span style={{color: '#aaa'}}>Select Crop...</span>;
                                        const crop = crops.find(c => (c.crop_id || c.c_id) === selected);
                                        return crop ? `${crop.crop_name || crop.c_name} / ${crop.crop_id || crop.c_id}` : "";
                                    }}
                                >
                                    {crops.map(c => (
                                        <MenuItem key={c.crop_id || c.c_id} value={c.crop_id || c.c_id}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <AuthorizedAvatar path={c.photo || c.crop_image || c.image} name={c.crop_name || c.c_name} size={30} variant="rounded" />
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.crop_name || c.c_name} / {c.crop_id || c.c_id}</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.crop_id && <FormHelperText>{errors.crop_id}</FormHelperText>}
                            </FormControl>
                        </Box>
                    </Box>

                    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={styles.tableHeader}>HARVESTED DATE</TableCell>
                                    <TableCell sx={styles.tableHeader}>EXPIRY DATE</TableCell>
                                    <TableCell sx={styles.tableHeader}>UNIT</TableCell>
                                    <TableCell sx={styles.tableHeader}>HECTARE</TableCell>
                                    <TableCell sx={styles.tableHeader}>QTY</TableCell>
                                    <TableCell sx={styles.tableHeader}>PRICE/UNIT</TableCell>
                                    <TableCell sx={styles.tableHeader}>LOCATION</TableCell>
                                    <TableCell sx={styles.tableHeader} align="center">DEL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formRows.map((row, index) => {
                                    const rowErr = errors[`row_${index}`] || {};
                                    return (
                                        <TableRow key={index}>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" type="date" value={row.harvested_date} 
                                                    error={!!rowErr.harvested_date}
                                                    helperText={rowErr.harvested_date}
                                                    onChange={(e) => handleInputChange(index, "harvested_date", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" type="date" value={row.expiry_date} 
                                                    error={!!rowErr.expiry_date}
                                                    helperText={rowErr.expiry_date}
                                                    onChange={(e) => handleInputChange(index, "expiry_date", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <Select fullWidth size="small" value={row.unit} onChange={(e) => handleInputChange(index, "unit", e.target.value)}>
                                                    <MenuItem value="kg">KG</MenuItem>
                                                    <MenuItem value="g">GRAM</MenuItem>
                                                    <MenuItem value="TON">TON</MenuItem>
                                                    <MenuItem value="Q">QUINTAL</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" type="number" value={row.hectares} 
                                                    error={!!rowErr.hectares}
                                                    helperText={rowErr.hectares}
                                                    onChange={(e) => handleInputChange(index, "hectares", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" type="number" value={row.quantity} 
                                                    error={!!rowErr.quantity}
                                                    helperText={rowErr.quantity}
                                                    onChange={(e) => handleInputChange(index, "quantity", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" type="number" value={row.price_per_unit} 
                                                    error={!!rowErr.price_per_unit}
                                                    helperText={rowErr.price_per_unit}
                                                    onChange={(e) => handleInputChange(index, "price_per_unit", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell sx={styles.tableCell}>
                                                <TextField 
                                                    fullWidth size="small" value={row.stored_location} 
                                                    error={!!rowErr.stored_location}
                                                    helperText={rowErr.stored_location}
                                                    onChange={(e) => handleInputChange(index, "stored_location", e.target.value)} 
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="error" onClick={() => handleRemoveRow(index)} disabled={formRows.length === 1}><DeleteIcon fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button startIcon={<AddIcon />} onClick={handleAddRow} sx={styles.addRowBtn}>+ ADD ANOTHER STOCK ITEM</Button>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit">CANCEL</Button>
                    <Button onClick={handleSubmitRegistration} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "SUBMIT REGISTRATION"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>EDIT MASTER ASSOCIATION</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Farmer Association</InputLabel>
                            <Select 
                                label="Farmer Association" 
                                value={editData.farmer_id} 
                                onChange={(e) => setEditData({...editData, farmer_id: e.target.value})}
                            >
                                {farmers.map(f => (
                                    <MenuItem key={f.f_id || f.id} value={f.f_id || f.id}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar path={f.f_photo || f.photo} name={f.first_name || f.user_name} size={24} />
                                            <Typography variant="body2">{f.first_name || f.user_name} / {f.f_id || f.id}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Crop Association</InputLabel>
                            <Select 
                                label="Crop Association" 
                                value={editData.crop_id} 
                                onChange={(e) => setEditData({...editData, crop_id: e.target.value})}
                            >
                                {crops.map(c => (
                                    <MenuItem key={c.crop_id || c.c_id} value={c.crop_id || c.c_id}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar path={c.photo || c.crop_image || c.image} name={c.crop_name || c.c_name} size={24} variant="rounded" />
                                            <Typography variant="body2">{c.crop_name || c.c_name} / {c.crop_id || c.c_id}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setEditOpen(false)} color="inherit">CANCEL</Button>
                    <Button onClick={handleUpdateMaster} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>UPDATE MASTER</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const styles = {
    container: { padding: "40px", backgroundColor: "#fff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px" },
    headerActions: { display: "flex", gap: "10px" },
    searchField: { width: "300px" },
    addButton: { backgroundColor: "#2e7d32", fontWeight: "800", borderRadius: "2px" },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" },
        "& .MuiDataGrid-cell": { borderBottom: "1px solid #f0f0f0" } 
    },
    badge: { fontSize: "11px", fontWeight: "900", color: "#1b5e20", padding: "4px 0" },
    actionBox: { display: "flex", gap: "8px" },
    editBtn: { color: "#1976d2", backgroundColor: "#e3f2fd", "&:hover": { backgroundColor: "#bbdefb" } },
    deleteBtn: { color: "#d32f2f", backgroundColor: "#ffebee", "&:hover": { backgroundColor: "#ffcdd2" } },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "center", pt: 3 },
    selectionHeaderArea: { 
        display: "flex", justifyContent: "center", gap: "30px", mb: 4, mt: 2,
        p: 3, backgroundColor: "#fcfcfc", border: "1px solid #eee", borderRadius: "8px" 
    },
    selectionBox: { width: "350px" },
    selectionLabel: { fontWeight: "900", color: "#2e7d32", mb: 1, fontSize: "0.85rem", textAlign: "center" },
    tableHeader: { fontWeight: "900", color: "#555", fontSize: "11px", textTransform: "uppercase" },
    tableCell: { padding: "6px", verticalAlign: "top" },
    addRowBtn: { mt: 2, color: "#2e7d32", fontWeight: "900" },
    saveBtn: { backgroundColor: "#2e7d32", fontWeight: "900" },
    printBtn: { color: "#2e7d32", fontWeight: "900", border: "1px solid #2e7d32" },
    dialogActions: { p: 3, justifyContent: "space-between" }
};

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

export default FarmerStock;