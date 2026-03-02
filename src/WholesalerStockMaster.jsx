import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DataGrid, getGridStringOperators, getGridNumericOperators } from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, MenuItem, IconButton, Typography, Select,
    FormControl, Avatar, CircularProgress, InputAdornment,
    GlobalStyles, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

// --- AUTHORIZED IMAGE FETCHING (SECURE) ---
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
            } catch (err) { setImgSrc(null); } finally { setFetching(false); }
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

const backendOperators = [
    ...getGridStringOperators().filter((op) => ['contains', 'equals', 'startsWith'].includes(op.value)),
    ...getGridNumericOperators().filter((op) => ['=', '>', '>=', '<', '<='].includes(op.value)),
];

const WholesalerStockMaster = () => {
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
    
    const [wholesalers, setWholesalers] = useState([]);
    const [crops, setCrops] = useState([]);
    const [masterSelection, setMasterSelection] = useState({ w_id: "", crop_id: "" });

    const [formRows, setFormRows] = useState([{ 
        unit: "kg", quantity: "", price_per_unit: "", stored_location: "",
        expiry_date: "" 
    }]);

    const [editData, setEditData] = useState({ 
        stock_id: null, 
        w_id: "", 
        crop_id: "" 
    });

    const queryPayload = useMuiDrfQuery({
        paginationModel, sortModel, filterModel: (searchText.trim() !== "" ? { items: [] } : filterModel),
        searchValue: searchText, searchField: "search", refreshTrigger: refresh
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/wholesaler-api/stock-master/', { params: queryPayload });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [queryPayload]);

    const loadOptions = async () => {
        try {
            const [wRes, cRes] = await Promise.all([
                axiosInstance.get('/wholesaler-api/wholesaler/?limit=1000'),
                axiosInstance.get('/admin-api/crop/?limit=1000')
            ]);
            setWholesalers(wRes.data.results || []);
            setCrops(cRes.data.results || []);
        } catch (err) { console.error("Error loading options:", err); }
    };

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadOptions(); }, []);

    const handleAddRow = () => setFormRows([...formRows, { unit: "kg", quantity: "", price_per_unit: "", stored_location: "", expiry_date: "" }]);
    const handleRemoveRow = (idx) => { if (formRows.length > 1) setFormRows(formRows.filter((_, i) => i !== idx)); };
    const handleInputChange = (idx, field, val) => {
        const updated = [...formRows];
        updated[idx][field] = val;
        setFormRows(updated);
    };

    const handleSubmit = async () => {
        if (!masterSelection.w_id || !masterSelection.crop_id) return;
        setSubmitLoading(true);
        try {
            const payload = {
                w_id: masterSelection.w_id,
                crop_id: masterSelection.crop_id,
                items: formRows
            };
            await axiosInstance.post('/wholesaler-api/stock-master/', payload);
            setOpen(false);
            setRefresh(p => p + 1);
            setFormRows([{ unit: "kg", quantity: "", price_per_unit: "", stored_location: "", expiry_date: "" }]);
            setMasterSelection({ w_id: "", crop_id: "" });
        } catch (err) { console.error(err.response?.data); } finally { setSubmitLoading(false); }
    };

    const handleEditClick = (row) => {
        setEditData({
            stock_id: row.stock_id,
            w_id: row.w_id,
            crop_id: row.crop_id
        });
        setEditOpen(true);
    };

    const handleEditChange = (field, val) => {
        setEditData(prev => ({ ...prev, [field]: val }));
    };

    const handleEditSubmit = async () => {
        setSubmitLoading(true);
        try {
            const payload = {
                w_id: editData.w_id,
                crop_id: editData.crop_id
            };
            await axiosInstance.put(`/wholesaler-api/stock-master/${editData.stock_id}/`, payload);
            setEditOpen(false);
            setRefresh(p => p + 1);
        } catch (err) { 
            console.error("Update Error:", err.response?.data); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Confirm deletion of this stock master record?")) {
            try {
                await axiosInstance.patch(`/wholesaler-api/stock-master/${id}/`, { deleted: 1 });
                setRefresh(p => p + 1);
            } catch (err) { console.error(err); }
        }
    };

    const columns = useMemo(() => [
        { field: "stock_id", headerName: "ID", width: 90, filterOperators: backendOperators },
        { 
            field: "business_name", headerName: "WHOLESALER / BUSINESS", flex: 1.5,
            renderCell: (p) => {
                const wInfo = wholesalers.find(w => w.w_id === p.row.w_id);
                const displayName = p.row.business_name || wInfo?.business_name || "N/A";
                return (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <AuthorizedAvatar path={p.row.w_photo || wInfo?.w_photo} name={displayName} size={32} />
                        <Typography sx={{ fontWeight: "700", fontSize: "13px" }}>{displayName} / {p.row.w_id}</Typography>
                    </Stack>
                );
            }
        },
        { 
            field: "crop_name", headerName: "CROP ASSOCIATION", flex: 1,
            renderCell: (p) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <AuthorizedAvatar variant="rounded" path={crops.find(c => c.crop_id === p.row.crop_id)?.photo} name={p.value} size={32} />
                    <Box sx={styles.badge}>{p.value?.toUpperCase()} / {p.row.crop_id}</Box>
                </Stack>
            )
        },
        { 
            field: "created_at", 
            headerName: "REGISTERED DATE", 
            width: 180,
            renderCell: (p) => (
                <Typography sx={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                    {p.value ? new Date(p.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                </Typography>
            )
        },
        { 
            field: "actions", headerName: "ACTIONS", width: 140, sortable: false,
            renderCell: (p) => (
                <Box sx={styles.actionBox}>
                    <IconButton sx={styles.editBtn} onClick={() => handleEditClick(p.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(p.row.stock_id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], [wholesalers, crops]);

    return (
        <Box sx={styles.container}>
            <GlobalStyles styles={printStyles} />
            
            {/* SCREEN HEADER */}
            <Box sx={styles.header} className="no-print">
                <Typography variant="h5" sx={styles.title}>WHOLESALER STOCK MASTER</Typography>
                <Box sx={styles.headerActions}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT PDF</Button>
                    <TextField 
                        size="small" placeholder="Global Search..." value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={styles.searchField}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={styles.addButton}>ADD WHOLESALE STOCK</Button>
                </Box>
            </Box>

            {/* PRINT ONLY CONTENT AREA */}
            <Box className="print-only" sx={styles.printContainer}>
                <Box sx={styles.farmerPrintHeader}>
                    <Typography sx={styles.farmerPrintLogo}>AGRO-I</Typography>
                    <Typography sx={styles.farmerPrintDate}>{new Date().toLocaleDateString('en-GB')}</Typography>
                </Box>

                <Table sx={styles.printTable}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={styles.printTableHead}>ID</TableCell>
                            <TableCell sx={styles.printTableHead}>WHOLESALER / BUSINESS</TableCell>
                            <TableCell sx={styles.printTableHead}>CROP ASSOCIATION</TableCell>
                            <TableCell sx={styles.printTableHead}>REGISTERED DATE</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.stock_id}>
                                <TableCell sx={styles.printTableCell}>{row.stock_id}</TableCell>
                                <TableCell sx={styles.printTableCell}>
                                    {row.business_name} / {row.w_id}
                                </TableCell>
                                <TableCell sx={styles.printTableCell}>
                                    {row.crop_name?.toUpperCase()} / {row.crop_id}
                                </TableCell>
                                <TableCell sx={styles.printTableCell}>
                                    {row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : "N/A"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* SCREEN TABLE */}
            <Box className="no-print">
                <DataGrid
                    rows={rows} columns={columns} getRowId={(r) => r.stock_id}
                    paginationMode="server" sortingMode="server" filterMode="server"
                    rowCount={rowCount} paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel} onSortModelChange={setSortModel}
                    filterModel={filterModel} onFilterModelChange={setFilterModel}
                    loading={loading} autoHeight sx={styles.dataGrid} disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                />
            </Box>

            {/* REGISTRATION DIALOG */}
            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="xl" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>WHOLESALER STOCK REGISTRATION</DialogTitle>
                <DialogContent dividers>
                    <Box sx={styles.selectionHeaderArea}>
                        <FormControl sx={styles.selectionBox} size="small">
                            <Typography sx={styles.selectionLabel}>SELECT WHOLESALER</Typography>
                            <Select 
                                value={masterSelection.w_id} 
                                onChange={(e) => setMasterSelection({...masterSelection, w_id: e.target.value})} 
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) return <span style={{color: '#aaa'}}>Select Wholesaler...</span>;
                                    const w = wholesalers.find(wh => wh.w_id === selected);
                                    return w ? `${w.business_name} / ${w.w_id}` : selected;
                                }}
                            >
                                {wholesalers.map(w => (
                                    <MenuItem key={w.w_id} value={w.w_id} sx={{ py: 1 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar path={w.w_photo} name={w.business_name} size={30} />
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                {w.business_name} / {w.w_id}
                                            </Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={styles.selectionBox} size="small">
                            <Typography sx={styles.selectionLabel}>SELECT CROP</Typography>
                            <Select 
                                value={masterSelection.crop_id} 
                                onChange={(e) => setMasterSelection({...masterSelection, crop_id: e.target.value})} 
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) return <span style={{color: '#aaa'}}>Select Crop...</span>;
                                    const c = crops.find(cr => cr.crop_id === selected);
                                    return c ? `${c.crop_name} / ${c.crop_id}` : selected;
                                }}
                            >
                                {crops.map(c => (
                                    <MenuItem key={c.crop_id} value={c.crop_id} sx={{ py: 1 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar variant="rounded" path={c.photo} name={c.crop_name} size={30} />
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                {c.crop_name} / {c.crop_id}
                                            </Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer component={Paper} sx={{boxShadow: 'none'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={styles.tableHeader}>QTY</TableCell>
                                    <TableCell sx={styles.tableHeader}>UNIT</TableCell>
                                    <TableCell sx={styles.tableHeader}>PRICE/UNIT</TableCell>
                                    <TableCell sx={styles.tableHeader}>LOCATION</TableCell>
                                    <TableCell sx={styles.tableHeader}>EXPIRY</TableCell>
                                    <TableCell align="center">DEL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formRows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={styles.tableCell}><TextField fullWidth size="small" type="number" value={row.quantity} onChange={(e) => handleInputChange(index, "quantity", e.target.value)} /></TableCell>
                                        <TableCell sx={styles.tableCell}>
                                            <Select fullWidth size="small" value={row.unit} onChange={(e) => handleInputChange(index, "unit", e.target.value)}>
                                                <MenuItem value="kg">KG</MenuItem><MenuItem value="TON">TON</MenuItem><MenuItem value="Q">QUINTAL</MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell sx={styles.tableCell}><TextField fullWidth size="small" type="number" value={row.price_per_unit} onChange={(e) => handleInputChange(index, "price_per_unit", e.target.value)} /></TableCell>
                                        <TableCell sx={styles.tableCell}><TextField fullWidth size="small" value={row.stored_location} onChange={(e) => handleInputChange(index, "stored_location", e.target.value)} /></TableCell>
                                        <TableCell sx={styles.tableCell}><TextField fullWidth size="small" type="date" value={row.expiry_date} onChange={(e) => handleInputChange(index, "expiry_date", e.target.value)} /></TableCell>
                                        <TableCell align="center">
                                            <IconButton color="error" onClick={() => handleRemoveRow(index)} disabled={formRows.length === 1}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button startIcon={<AddIcon />} onClick={handleAddRow} sx={styles.addRowBtn}>+ ADD ITEM</Button>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)}>CANCEL</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} /> : "SUBMIT STOCK"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={editOpen} onClose={() => !submitLoading && setEditOpen(false)} maxWidth="sm" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>UPDATE STOCK ASSOCIATIONS</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={4} sx={{ p: 2 }}>
                        <FormControl fullWidth size="small">
                            <Typography sx={styles.editFormLabel}>WHOLESALER ASSOCIATION</Typography>
                            <Select 
                                value={editData.w_id || ""} 
                                onChange={(e) => handleEditChange("w_id", e.target.value)}
                                displayEmpty
                                renderValue={(selected) => {
                                    const w = wholesalers.find(wh => wh.w_id === selected);
                                    return (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AuthorizedAvatar path={w?.w_photo} name={w?.business_name} size={22} />
                                            <Typography sx={{ fontSize: '13px', fontWeight: '700' }}>{w ? `${w.business_name} / ${w.w_id}` : "Select Wholesaler"}</Typography>
                                        </Stack>
                                    );
                                }}
                            >
                                {wholesalers.map(w => (
                                    <MenuItem key={w.w_id} value={w.w_id}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar path={w.w_photo} name={w.business_name} size={25} />
                                            <Typography sx={{ fontSize: '13px' }}>{w.business_name} / {w.w_id}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <Typography sx={styles.editFormLabel}>CROP ASSOCIATION</Typography>
                            <Select 
                                value={editData.crop_id || ""} 
                                onChange={(e) => handleEditChange("crop_id", e.target.value)}
                                displayEmpty
                                renderValue={(selected) => {
                                    const c = crops.find(cr => cr.crop_id === selected);
                                    return (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AuthorizedAvatar variant="rounded" path={c?.photo} name={c?.crop_name} size={22} />
                                            <Typography sx={{ fontSize: '13px', fontWeight: '700' }}>{c ? `${c.crop_name} / ${c.crop_id}` : "Select Crop"}</Typography>
                                        </Stack>
                                    );
                                }}
                            >
                                {crops.map(c => (
                                    <MenuItem key={c.crop_id} value={c.crop_id}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AuthorizedAvatar variant="rounded" path={c.photo} name={c.crop_name} size={25} />
                                            <Typography sx={{ fontSize: '13px' }}>{c.crop_name} / {c.crop_id}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setEditOpen(false)}>CANCEL</Button>
                    <Button onClick={handleEditSubmit} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} /> : "UPDATE STOCK"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- STYLES (CLEAN CONST STYLE) ---
const styles = {
    container: { padding: "40px", backgroundColor: "#fff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px" },
    headerActions: { display: "flex", gap: "10px" },
    searchField: { width: "300px" },
    addButton: { backgroundColor: "#2e7d32", fontWeight: "800", borderRadius: "2px" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" },
        "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } 
    },
    badge: { fontSize: "11px", fontWeight: "900", color: "#1b5e20" },
    actionBox: { display: "flex", gap: "8px" },
    editBtn: { color: "#1976d2", backgroundColor: "#e3f2fd" },
    deleteBtn: { color: "#d32f2f", backgroundColor: "#ffebee" },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "center", textTransform: "uppercase" },
    selectionHeaderArea: { display: "flex", justifyContent: "center", gap: "30px", mb: 4, p: 3, backgroundColor: "#fcfcfc", border: "1px solid #eee" },
    selectionBox: { width: "350px" },
    selectionLabel: { fontWeight: "900", color: "#2e7d32", mb: 1, fontSize: "0.85rem", textAlign: "center" },
    editFormLabel: { fontWeight: "900", color: "#2e7d32", mb: 1, fontSize: "0.75rem", textTransform: "uppercase" },
    tableHeader: { fontWeight: "900", color: "#555", fontSize: "11px" },
    tableCell: { padding: "6px" },
    addRowBtn: { mt: 2, color: "#2e7d32", fontWeight: "900" },
    saveBtn: { backgroundColor: "#2e7d32", fontWeight: "900", borderRadius: '2px' },
    printBtn: { color: "#2e7d32", fontWeight: "900", border: "1px solid #2e7d32" },
    dialogActions: { p: 3, justifyContent: "space-between" },
    
    printContainer: { width: '100%', padding: '0px' },
    farmerPrintHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '3px solid #2e7d32', 
        paddingBottom: '10px', 
        marginBottom: '20px' 
    },
    farmerPrintLogo: { fontSize: '24px', fontWeight: '900', color: '#2e7d32' },
    farmerPrintDate: { fontSize: '14px', fontWeight: '700', color: '#000' },
    printTable: { width: '100%', borderCollapse: 'collapse' },
    printTableHead: { 
        textAlign: 'left', 
        padding: '12px 8px', 
        borderBottom: '2px solid #000', 
        fontSize: '12px', 
        fontWeight: '900', 
        textTransform: 'uppercase' 
    },
    printTableCell: { 
        padding: '10px 8px', 
        borderBottom: '1px solid #ddd', 
        fontSize: '13px', 
        color: '#000' 
    }
}; 

const printStyles = {
    "@media screen": { ".print-only": { display: "none !important" } },
    "@media print": { 
        ".sidebar, .navbar, .nav-container, .no-print, header, footer": { display: "none !important" }, 
        ".print-only": { display: "block !important" },
        "body": { padding: "0", margin: "0", backgroundColor: "#fff !important" },
        "@page": { size: "landscape", margin: "10mm" },
        ".print-only": { 
            width: "100% !important", 
            position: "absolute", 
            left: 0, 
            top: 0,
            margin: 0,
            padding: "20px"
        },
        "tr": { pageBreakInside: "avoid" }
    }
};

export default WholesalerStockMaster;