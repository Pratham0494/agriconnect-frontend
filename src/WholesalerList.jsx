import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators,
    getGridNumericOperators 
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, MenuItem, IconButton, Typography, Select,
    FormControl, InputLabel, Avatar, CircularProgress, InputAdornment,
    GlobalStyles, FormHelperText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import FilePresentIcon from "@mui/icons-material/FilePresent";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

/** * Clean Const Style Configuration
 */
const stringOperators = getGridStringOperators().filter((op) => 
    ['contains', 'equals', 'startsWith', 'endsWith'].includes(op.value)
);

const numericOperators = getGridNumericOperators()
  .filter((op) => ['=', '>', '>=', '<', '<='].includes(op.value));

const formatTime = (val) => {
    if (!val) return "-";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const AuthorizedAvatar = ({ path, firstName, styles }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!path) return;
        let mounted = true;
        const fetchSecureImage = async () => {
            setFetching(true);
            try {
                const response = await axiosInstance.get(path, { responseType: 'blob' });
                const objectUrl = URL.createObjectURL(new Blob([response.data]));
                if (mounted) setImgSrc(objectUrl);
            } catch (err) { console.error("Media Fetch Error:", err); }
            finally { if (mounted) setFetching(false); }
        };
        fetchSecureImage();
        return () => { mounted = false; if (imgSrc) URL.revokeObjectURL(imgSrc); };
    }, [path]);

    return (
        <Avatar src={imgSrc} sx={styles} variant="rounded">
            {fetching ? <CircularProgress size={16} color="inherit" /> : firstName?.charAt(0)}
        </Avatar>
    );
};

function WholesalerList() {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    
    const [selectedId, setSelectedId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        email: "", password: "", confirm_password: "", first_name: "", 
        last_name: "", gender: "M", city: "", state: "", address: "", 
        gst_no: "", w_phone: "", w_photo: null, aadhar_no: "",
        business_proof: null, business_name: "", pan_no: "", 
        status: "U", deleted: 0
    });

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
            const response = await axiosInstance.get('/wholesaler-api/wholesaler/', { 
                params: { ...queryPayload, deleted: 0 } 
            });
            
            if (response.data && response.data.results) {
                setRows(response.data.results);
                setRowCount(response.data.count);
            } else {
                setRows(Array.isArray(response.data) ? response.data : []);
                setRowCount(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (err) { 
            console.error("Wholesaler Fetch Error:", err); 
            setRows([]);
        } finally { setLoading(false); }
    }, [queryPayload]);

    useEffect(() => { loadData(); }, [loadData]);

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.business_name) tempErrors.business_name = "Business Name is required";
        if (!formData.email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid Email format";
        if (!formData.w_phone) tempErrors.w_phone = "Phone number is required";
        else if (!/^\d{10,11}$/.test(formData.w_phone)) tempErrors.w_phone = "Phone must be 10-11 digits";
        if (!selectedId) {
            if (!formData.password) tempErrors.password = "Password is required";
            if (formData.password !== formData.confirm_password) tempErrors.confirm_password = "Passwords do not match";
        }
        if (!formData.gst_no) tempErrors.gst_no = "GST Number is required";
        if (!formData.pan_no) tempErrors.pan_no = "PAN is required";
        if (!formData.aadhar_no) tempErrors.aadhar_no = "Aadhar is required";
        if (!formData.business_proof && !selectedId) tempErrors.business_proof = "Business proof document is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitLoading(true);
        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (["confirm_password", "created_at", "updated_at"].includes(key)) return;
            if (selectedId && key === "password" && !formData[key]) return;
            if ((key === "w_photo" || key === "business_proof") && formData[key] instanceof File) {
                uploadData.append(key, formData[key]);
            } else if (formData[key] !== null && formData[key] !== "" && !["w_photo", "business_proof"].includes(key)) {
                uploadData.append(key, formData[key]);
            }
        });
        try {
            const url = selectedId ? `/wholesaler-api/wholesaler/${selectedId}/` : `/wholesaler-api/wholesaler/`;
            await axiosInstance({
                method: selectedId ? 'patch' : 'post',
                url: url,
                data: uploadData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOpen(false);
            setRefresh(p => p + 1);
            resetForm();
        } catch (err) {
            if (err.response?.data) {
                const serverErrors = {};
                Object.keys(err.response.data).forEach(field => {
                    serverErrors[field] = Array.isArray(err.response.data[field]) 
                        ? err.response.data[field][0] 
                        : err.response.data[field];
                });
                setErrors(serverErrors);
            }
        } finally { setSubmitLoading(false); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this wholesaler?")) {
            try {
                await axiosInstance.patch(`/wholesaler-api/wholesaler/${id}/`, { deleted: 1 });
                setRefresh(p => p + 1);
            } catch (err) { console.error("Delete Error:", err); }
        }
    };

    const resetForm = () => {
        setFormData({
            email: "", password: "", confirm_password: "", first_name: "", 
            last_name: "", gender: "M", city: "", state: "", address: "", 
            gst_no: "", w_phone: "", w_photo: null, aadhar_no: "",
            business_proof: null, business_name: "", pan_no: "", 
            status: "U", deleted: 0
        });
        setPreview(null);
        setSelectedId(null);
        setErrors({});
    };

    const columns = useMemo(() => [
        { field: "w_id", headerName: "ID", width: 80, type: "number", filterOperators: numericOperators },
        { 
            field: "w_photo", headerName: "PHOTO", width: 90, filterable: false, 
            renderCell: (p) => <AuthorizedAvatar path={p.value} firstName={p.row?.first_name} styles={styles.gridAvatar} /> 
        },
        { field: "business_name", headerName: "BUSINESS", width: 150, filterOperators: stringOperators },
        { field: "first_name", headerName: "FIRST NAME", width: 130, filterOperators: stringOperators },
        { field: "last_name", headerName: "LAST NAME", width: 130, filterOperators: stringOperators },
        { field: "email", headerName: "EMAIL", width: 180, filterOperators: stringOperators },
        { field: "gst_no", headerName: "GST NO", width: 150, filterOperators: stringOperators },
        { field: "pan_no", headerName: "PAN", width: 120, filterOperators: stringOperators },
        { 
            field: "status", headerName: "STATUS", width: 120, 
            renderCell: (p) => (
                <Typography sx={{ fontWeight: 'bold', color: p.value === 'V' ? '#2e7d32' : '#d32f2f', fontSize: '0.85rem' }}>
                    {p.value === 'V' ? 'VERIFIED' : 'UNVERIFIED'}
                </Typography>
            )
        },
        { field: "w_phone", headerName: "PHONE", width: 130, filterOperators: numericOperators },
        { field: "state", headerName: "STATE", width: 120, filterOperators: stringOperators },
        { 
            field: "created_at", headerName: "JOINED", width: 150, type: "date",
            valueFormatter: (params) => formatTime(params?.value || params)
        },
        {
            field: "actions", headerName: "ACTIONS", width: 110, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox}>
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        setSelectedId(params.row.w_id); 
                        setFormData({...params.row, password: "", confirm_password: ""}); 
                        setOpen(true); 
                    }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(params.row.w_id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ], []);

    // Exact Print Content Structure - Matches Horizontal List Style
    const printContent = useMemo(() => (
        <div id="print-section" className="print-only">
            <div className="print-header">
                <span className="agro-brand">AGRO-I</span>
                <span className="print-date">{new Date().toLocaleDateString()}</span>
            </div>
            <table className="print-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>BUSINESS NAME</th>
                        <th>FULL NAME</th>
                        <th>PHONE</th>
                        <th>EMAIL</th>
                        <th>GST NO</th>
                        <th>CITY/STATE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.w_id}>
                            <td>{row.w_id}</td>
                            <td>{row.business_name || "-"}</td>
                            <td>{`${row.first_name || ""} ${row.last_name || ""}`}</td>
                            <td>{row.w_phone || "-"}</td>
                            <td>{row.email || "-"}</td>
                            <td>{row.gst_no || "-"}</td>
                            <td>{`${row.city || ""}, ${row.state || ""}`}</td>
                            <td className="status-cell">{row.status === 'V' ? 'VERIFIED' : 'UNVERIFIED'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ), [rows]);

    return (
        <Box sx={styles.container}>
            <GlobalStyles styles={styles.globalPrintStyles} />
            {printContent}
            <Box sx={styles.header}>
                <Typography variant="h5" sx={styles.title}>WHOLESALER MANAGEMENT</Typography>
                <Box sx={styles.headerActions}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT</Button>
                    <TextField 
                        size="small" 
                        placeholder="Global Search..." 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        sx={styles.searchField}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> 
                        }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpen(true); }} sx={styles.addButton}>REGISTER WHOLESALER</Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox}>
                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    getRowId={(r) => r.w_id} 
                    paginationMode="server" 
                    sortingMode="server" 
                    filterMode="server"
                    rowCount={rowCount} 
                    paginationModel={paginationModel} 
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    onSortModelChange={setSortModel} 
                    onFilterModelChange={setFilterModel} 
                    loading={loading} 
                    autoHeight 
                    sx={styles.dataGrid}
                />
            </Box>

            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT WHOLESALER" : "WHOLESALER REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3} sx={styles.photoUploadArea}>
                            <Avatar src={preview || (typeof formData.w_photo === 'string' ? formData.w_photo : null)} sx={styles.formAvatar} />
                            <Button variant="outlined" component="label" sx={styles.uploadBtn}>SELECT PHOTO
                                <input type="file" hidden accept="image/*" onChange={(e) => { 
                                    const file = e.target.files[0]; 
                                    if (file) { setFormData({...formData, w_photo: file}); setPreview(URL.createObjectURL(file)); }
                                }} />
                            </Button>
                            {errors.w_photo && <Typography color="error" variant="caption">{errors.w_photo}</Typography>}
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField error={!!errors.business_name} helperText={errors.business_name} fullWidth label="Business Name *" size="small" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField error={!!errors.email} helperText={errors.email} fullWidth label="Email Address *" size="small" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField error={!!errors.w_phone} helperText={errors.w_phone} fullWidth label="Phone *" size="small" value={formData.w_phone} onChange={e => setFormData({...formData, w_phone: e.target.value})} /></Grid>
                                {!selectedId && (
                                    <>
                                        <Grid item xs={6}><TextField error={!!errors.password} helperText={errors.password} fullWidth type="password" label="Password *" size="small" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></Grid>
                                        <Grid item xs={6}><TextField error={!!errors.confirm_password} helperText={errors.confirm_password} fullWidth type="password" label="Confirm Password *" size="small" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} /></Grid>
                                    </>
                                )}
                                <Grid item xs={6}><TextField error={!!errors.first_name} helperText={errors.first_name} fullWidth label="First Name *" size="small" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></Grid>
                                <Grid item xs={6}><TextField error={!!errors.last_name} helperText={errors.last_name} fullWidth label="Last Name" size="small" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></Grid>
                                <Grid item xs={4}><TextField error={!!errors.gst_no} helperText={errors.gst_no} fullWidth label="GST Number *" size="small" value={formData.gst_no} onChange={e => setFormData({...formData, gst_no: e.target.value.toUpperCase()})} /></Grid>
                                <Grid item xs={4}><TextField error={!!errors.pan_no} helperText={errors.pan_no} fullWidth label="PAN Number *" size="small" value={formData.pan_no} onChange={e => setFormData({...formData, pan_no: e.target.value.toUpperCase()})} /></Grid>
                                <Grid item xs={4}><TextField error={!!errors.aadhar_no} helperText={errors.aadhar_no} fullWidth label="Aadhar Number *" size="small" value={formData.aadhar_no} onChange={e => setFormData({...formData, aadhar_no: e.target.value})} /></Grid>
                                <Grid item xs={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Gender</InputLabel>
                                        <Select label="Gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                            <MenuItem value="M">MALE</MenuItem><MenuItem value="F">FEMALE</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}><TextField error={!!errors.city} helperText={errors.city} fullWidth label="City" size="small" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></Grid>
                                <Grid item xs={4}><TextField error={!!errors.state} helperText={errors.state} fullWidth label="State" size="small" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></Grid>
                                <Grid item xs={12}>
                                    <Button variant="outlined" component="label" fullWidth startIcon={<FilePresentIcon />} sx={{ borderStyle: 'dashed', color: errors.business_proof ? 'error.main' : 'inherit' }}>
                                        {formData.business_proof?.name || "UPLOAD BUSINESS PROOF (PDF/IMAGE) *"}
                                        <input type="file" hidden onChange={(e) => setFormData({...formData, business_proof: e.target.files[0]})} />
                                    </Button>
                                    {errors.business_proof && <FormHelperText error>{errors.business_proof}</FormHelperText>}
                                </Grid>
                                <Grid item xs={12}><TextField error={!!errors.address} helperText={errors.address} fullWidth multiline rows={2} label="Address" size="small" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit">CANCEL</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : (selectedId ? "UPDATE" : "REGISTER")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

const styles = {
    container: { padding: "40px", backgroundColor: "#ffffff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    headerActions: { display: "flex", gap: "12px", alignItems: "center" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px", textTransform: "uppercase" },
    searchField: { 
        width: "300px", 
        backgroundColor: "#f9f9f9",
        "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #ccc" },
        "& .MuiOutlinedInput-root": { borderRadius: "4px" }
    },
    printBtn: { 
        color: "#2e7d32", 
        fontWeight: "900", 
        border: "1px solid #2e7d32", 
        height: "40px", 
        minWidth: "120px",
        borderRadius: "2px"
    },
    addButton: { 
        backgroundColor: "#2e7d32", 
        color: "#ffffff", 
        fontWeight: "800", 
        borderRadius: "2px", 
        height: "40px",
        minWidth: "220px", 
        whiteSpace: "nowrap" 
    },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "4px" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" },
    },
    gridAvatar: { width: "44px", height: "44px", borderRadius: "4px" },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1b5e20" },
    deleteBtn: { color: "#d32f2f" },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "left" },
    photoUploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
    formAvatar: { width: "150px", height: "150px", border: "2px solid #e0e0e0" },
    uploadBtn: { fontSize: "10px", fontWeight: "900", color: "#1b5e20", borderColor: "#1b5e20" },
    dialogActions: { padding: "16px", justifyContent: "flex-end", gap: "8px" },
    saveBtn: { backgroundColor: "#1b5e20", color: "#ffffff", fontWeight: "900", minWidth: "160px" },
    globalPrintStyles: {
        ".print-only": { display: "none" },
        "@media print": { 
            "body *": { visibility: "hidden" },
            ".print-only, .print-only *": { visibility: "visible", display: "block !important" },
            ".print-only": { position: "absolute", left: 0, top: 0, width: "100%" },
            ".print-header": { 
                display: "flex !important", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderBottom: "2px solid #1b5e20", 
                paddingBottom: "10px", 
                marginBottom: "20px" 
            },
            ".agro-brand": { fontSize: "28px", fontWeight: "900", color: "#1b5e20" },
            ".print-date": { fontSize: "14px", fontWeight: "bold" },
            ".print-table": { width: "100%", borderCollapse: "collapse", display: "table !important" },
            ".print-table th": { borderBottom: "2px solid #333", textAlign: "left", padding: "12px 8px", fontSize: "10px", textTransform: "uppercase" },
            ".print-table td": { borderBottom: "1px solid #eee", padding: "10px 8px", fontSize: "10px" },
            ".print-table tr": { display: "table-row !important" },
            ".status-cell": { fontWeight: "bold", fontSize: "9px" }
        }
    }
};

export default WholesalerList;