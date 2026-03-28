import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators,
    getGridNumericOperators 
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, MenuItem, IconButton, Typography, Select,
    FormControl, InputLabel, Avatar, CircularProgress, FormHelperText,
    GlobalStyles
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

const styles = {
    container: { padding: "40px", backgroundColor: "#ffffff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    headerActions: { display: "flex", gap: "12px", alignItems: "center" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px", textTransform: "uppercase" },
    searchField: { width: "350px", backgroundColor: "#f9f9f9" },
    printBtn: { 
        color: "#2e7d32", fontWeight: "900", border: "1px solid #2e7d32", 
        height: "40px", minWidth: "120px", borderRadius: "2px"
    },
    addButton: { 
        backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "800", 
        borderRadius: "2px", height: "40px", minWidth: "220px" 
    },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "4px" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" }
    },
    gridAvatar: { width: "44px", height: "44px", borderRadius: "4px" },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1976d2" },
    deleteBtn: { color: "#d32f2f" },
    modalTitle: { fontWeight: "900", color: "#1b5e20" },
    photoUploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    formAvatar: { width: "120px", height: "120px", border: "2px solid #e0e0e0", borderRadius: "8px" },
    uploadBtn: { fontSize: "10px", fontWeight: "900", color: "#2e7d32", borderColor: "#2e7d32" },
    saveBtn: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", minWidth: "160px" },
    fileInputLabel: { display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '4px', color: '#555' },
    printOverrides: {
        "@media print": {
            "@page": { size: "landscape", margin: "5mm" },
            "body *": { visibility: "hidden !important" },
            ".print-area, .print-area *": { visibility: "visible !important" },
            ".print-area": { position: "absolute !important", left: "0", top: "0", width: "100%", zoom: "80%" },
            ".no-print": { display: "none !important" }
        }
    }
};

/**
 * SYNCHRONIZED OPERATORS:
 * These map to the backend lookup expressions via useMuiDrfQuery.
 */
const stringOperators = getGridStringOperators().filter((op) => 
    ['contains', 'startsWith', 'endsWith', 'is', 'equals'].includes(op.value)
);

const numericOperators = getGridNumericOperators().filter((op) => 
    ['=', '>', '>=', '<', '<='].includes(op.value)
);

const AuthorizedAvatar = ({ path, firstName, styles }) => {
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        if (!path || typeof path !== 'string') return;
        let mounted = true;
        const fetchImg = async () => {
            try {
                const res = await axiosInstance.get(path, { responseType: 'blob' });
                if (mounted) setImgSrc(URL.createObjectURL(res.data));
            } catch (err) { console.error("Img load failed"); }
        };
        fetchImg();
        return () => { mounted = false; if (imgSrc) URL.revokeObjectURL(imgSrc); };
    }, [path]);

    return <Avatar src={imgSrc} sx={styles} variant="rounded">{firstName?.charAt(0)}</Avatar>;
};

function FarmerList() {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    
    const [selectedId, setSelectedId] = useState(null);
    const [previews, setPreviews] = useState({ f_photo: null, aadhar_photo: null, farmer_id_photo: null });
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        user_name: "", 
        password: "", 
        first_name: "", 
        last_name: "", 
        gender: "M", 
        f_phone: "", 
        state: "", 
        sub_district: "", 
        address: "", 
        aadhar_no: "", 
        ekyf_id: "", 
        f_photo: null, 
        aadhar_photo: null, 
        farmer_id_photo: null, 
        deleted: 0
    });

    // Custom hook to convert MUI DataGrid state to DRF Query Params
    const queryPayload = useMuiDrfQuery({
        paginationModel,
        sortModel,
        filterModel,
        searchValue: searchText,
        searchField: "search",
        refreshTrigger: refresh
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/farmer-api/farmer/', { params: queryPayload });
            setRows(res.data.results || []);
            setRowCount(res.data.count || 0);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, [queryPayload]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleFileChange = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(prev => ({ ...prev, [field]: file }));
        setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        setErrors(prev => ({ ...prev, [field]: null })); 
        
        if (field === 'aadhar_photo') {
            setOcrLoading(true);
            const ocrData = new FormData();
            ocrData.append('aadhar_photo', file);
            try {
                const res = await axiosInstance.post('/farmer-api/ocr-aadhar/', ocrData);
                if (res.data?.aadhar_no) setFormData(prev => ({ ...prev, aadhar_no: res.data.aadhar_no }));
            } catch (err) { console.error("OCR Error"); }
            finally { setOcrLoading(false); }
        }
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        setErrors({}); 
        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (selectedId && key === "password" && !formData[key]) return;
            if (['f_photo', 'aadhar_photo', 'farmer_id_photo'].includes(key)) {
                if (formData[key] instanceof File) {
                    uploadData.append(key, formData[key]);
                }
            } else {
                uploadData.append(key, formData[key] === null ? "" : formData[key]);
            }
        });

        try {
            const url = selectedId ? `/farmer-api/farmer/${selectedId}/` : `/farmer-api/farmer/`;
            await axiosInstance({
                method: selectedId ? 'patch' : 'post',
                url: url,
                data: uploadData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOpen(false);
            setRefresh(p => p + 1);
        } catch (err) { 
            if (err.response?.data) setErrors(err.response.data);
        } finally { setSubmitLoading(false); }
    };

    const columns = useMemo(() => [
        { 
            field: "f_id", 
            headerName: "ID", 
            width: 70, 
            type: 'number', 
            filterOperators: numericOperators 
        },
        { 
            field: "f_photo", 
            headerName: "PHOTO", 
            width: 80, 
            sortable: false, 
            filterable: false, 
            renderCell: (p) => <AuthorizedAvatar path={p.value} firstName={p.row?.first_name} styles={styles.gridAvatar} /> 
        },
        { field: "user_name", headerName: "USERNAME", width: 120, filterOperators: stringOperators },
        { field: "first_name", headerName: "FIRST NAME", width: 120, filterOperators: stringOperators },
        { field: "last_name", headerName: "LAST NAME", width: 120, filterOperators: stringOperators },
        { 
            field: "gender", 
            headerName: "GENDER", 
            width: 90, 
            filterOperators: stringOperators,
            renderCell: (params) => (
                <Typography sx={{ fontSize: '0.8125rem' }}>
                    {params.row.gender === 'M' ? 'MALE' : 'FEMALE'}
                </Typography>
            )
        },
        { field: "f_phone", headerName: "PHONE", width: 120, filterOperators: stringOperators },
        { field: "aadhar_no", headerName: "AADHAR", width: 140, filterOperators: stringOperators },
        { field: "ekyf_id", headerName: "EKYF ID", width: 140, filterOperators: stringOperators },
        { field: "state", headerName: "STATE", width: 120, filterOperators: stringOperators },
        { field: "sub_district", headerName: "SUB-DISTRICT", width: 140, filterOperators: stringOperators },
        {
            field: "actions", headerName: "ACTIONS", width: 100, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        setSelectedId(params.row.f_id); 
                        setFormData({...params.row, password: ""}); 
                        setPreviews({ f_photo: null, aadhar_photo: null, farmer_id_photo: null });
                        setErrors({});
                        setOpen(true); 
                    }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={async () => { 
                        if(window.confirm("Confirm Delete?")) { 
                            await axiosInstance.patch(`/farmer-api/farmer/${params.row.f_id}/`, { deleted: 1 }); 
                            setRefresh(p => p + 1); 
                        } 
                    }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ], [numericOperators, stringOperators]);

    return (
        <Box sx={styles.container}>
            <GlobalStyles styles={styles.printOverrides} />
            <Box sx={styles.header} className="no-print">
                <Typography variant="h5" sx={styles.title}>FARMER MANAGEMENT</Typography>
                <Box sx={styles.headerActions}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT</Button>
                    <TextField 
                        size="small" 
                        placeholder="Global Search..." 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        sx={styles.searchField}
                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: '#666' }} /> }} 
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { 
                        setSelectedId(null); 
                        setFormData({
                            user_name: "", password: "", first_name: "", last_name: "", 
                            gender: "M", f_phone: "", state: "", sub_district: "", 
                            address: "", aadhar_no: "", ekyf_id: "", 
                            f_photo: null, aadhar_photo: null, farmer_id_photo: null, deleted: 0
                        });
                        setPreviews({ f_photo: null, aadhar_photo: null, farmer_id_photo: null });
                        setErrors({});
                        setOpen(true); 
                    }} sx={styles.addButton}>REGISTER FARMER</Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox} className="print-area">
                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    getRowId={(r) => r.f_id} 
                    paginationMode="server" 
                    rowCount={rowCount} 
                    paginationModel={paginationModel} 
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    sortingMode="server"
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    filterMode="server"
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    loading={loading} 
                    autoHeight 
                    sx={styles.dataGrid} 
                />
            </Box>

            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="md" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT PROFILE" : "NEW REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Box sx={styles.photoUploadArea}>
                                <Typography sx={styles.fileInputLabel}>Farmer Photo</Typography>
                                <Avatar src={previews.f_photo || formData.f_photo} sx={styles.formAvatar} variant="rounded" />
                                <Button variant="outlined" component="label" sx={styles.uploadBtn} color={errors.f_photo ? "error" : "primary"}>
                                    SELECT IMAGE <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'f_photo')} />
                                </Button>
                                {errors.f_photo && <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: 'center' }}>{errors.f_photo}</Typography>}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><TextField fullWidth label="Username *" size="small" error={!!errors.user_name} helperText={errors.user_name} value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth type="password" label={selectedId ? "New Password (Optional)" : "Password *"} size="small" error={!!errors.password} helperText={errors.password} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="First Name *" size="small" error={!!errors.first_name} helperText={errors.first_name} value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="Last Name" size="small" error={!!errors.last_name} helperText={errors.last_name} value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth size="small" error={!!errors.gender}>
                                        <InputLabel>Gender</InputLabel>
                                        <Select label="Gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                            <MenuItem value="M">MALE</MenuItem>
                                            <MenuItem value="F">FEMALE</MenuItem>
                                        </Select>
                                        {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}><TextField fullWidth label="Phone *" size="small" error={!!errors.f_phone} helperText={errors.f_phone} value={formData.f_phone} onChange={e => setFormData({...formData, f_phone: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="Aadhar No *" size="small" error={!!errors.aadhar_no} helperText={ocrLoading ? "Scanning..." : (errors.aadhar_no || "12-digit number")} value={formData.aadhar_no} onChange={e => setFormData({...formData, aadhar_no: e.target.value})} InputProps={{ endAdornment: ocrLoading && <CircularProgress size={16} /> }} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="EKYF ID *" size="small" error={!!errors.ekyf_id} helperText={errors.ekyf_id} value={formData.ekyf_id} onChange={e => setFormData({...formData, ekyf_id: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="State *" size="small" error={!!errors.state} helperText={errors.state} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField fullWidth label="Sub-District *" size="small" error={!!errors.sub_district} helperText={errors.sub_district} value={formData.sub_district} onChange={e => setFormData({...formData, sub_district: e.target.value})} /></Grid>
                                <Grid item xs={6}>
                                    <Typography sx={styles.fileInputLabel}>Aadhar Card Photo</Typography>
                                    <Button fullWidth variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={styles.uploadBtn} color={errors.aadhar_photo ? "error" : "primary"}>
                                        {formData.aadhar_photo ? "Aadhar Uploaded" : "Upload Aadhar"} <input type="file" hidden onChange={(e) => handleFileChange(e, 'aadhar_photo')} />
                                    </Button>
                                    {errors.aadhar_photo && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>{errors.aadhar_photo}</Typography>}
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={styles.fileInputLabel}>Farmer ID Card Photo</Typography>
                                    <Button fullWidth variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={styles.uploadBtn} color={errors.farmer_id_photo ? "error" : "primary"}>
                                        {formData.farmer_id_photo ? "ID Uploaded" : "Upload ID"} <input type="file" hidden onChange={(e) => handleFileChange(e, 'farmer_id_photo')} />
                                    </Button>
                                    {errors.farmer_id_photo && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>{errors.farmer_id_photo}</Typography>}
                                </Grid>
                                <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Address" size="small" error={!!errors.address} helperText={errors.address} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">CANCEL</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} /> : "SAVE DATA"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FarmerList;