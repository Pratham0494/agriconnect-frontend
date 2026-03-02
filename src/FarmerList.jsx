import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators,
    getGridNumericOperators,
    GridToolbarContainer,
    GridToolbarExport 
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, MenuItem, IconButton, Typography, Select,
    FormControl, InputLabel, Avatar, CircularProgress, InputAdornment,
    GlobalStyles
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

const styles = {
    container: { padding: "40px", backgroundColor: "#ffffff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    headerActions: { display: "flex", gap: "12px", alignItems: "center" },
    title: { fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", paddingLeft: "16px", textTransform: "uppercase" },
    searchField: { width: "350px", backgroundColor: "#f9f9f9" },
    printBtn: { 
        color: "#2e7d32", 
        fontWeight: "900", 
        border: "1px solid #2e7d32", 
        height: "40px", 
        minWidth: "120px",
        borderRadius: "2px",
        "&:hover": { backgroundColor: "rgba(46, 125, 50, 0.04)", borderColor: "#1b5e20" }
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
        "& .MuiDataGrid-footerContainer": { display: "flex" }, 
        "& .MuiDataGrid-paper": { boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }
    },
    gridAvatar: { width: "44px", height: "44px", borderRadius: "4px" },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1976d2" },
    deleteBtn: { color: "#d32f2f" },
    modalTitle: { fontWeight: "900", color: "#1b5e20", textAlign: "left" },
    photoUploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
    formAvatar: { width: "150px", height: "150px", border: "2px solid #e0e0e0" },
    uploadBtn: { fontSize: "10px", fontWeight: "900", color: "#2e7d32", borderColor: "#2e7d32" },
    dialogActions: { padding: "16px", justifyContent: "flex-end", gap: "8px" },
    saveBtn: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", minWidth: "160px" },
    
    printOverrides: {
        "@media print": {
            "@page": { 
                size: "landscape", 
                margin: "5mm" 
            },
            "body": { 
                margin: "0", 
                padding: "0", 
                backgroundColor: "#fff !important", 
                overflow: "visible !important" 
            },
            "body *": { visibility: "hidden !important" },
            ".print-area, .print-area *": { visibility: "visible !important" },
            ".print-area": { 
                position: "absolute !important", 
                left: "0 !important", 
                top: "0 !important", 
                width: "100% !important", 
                margin: "0 !important", 
                padding: "0 !important",
                boxShadow: "none !important",
                display: "block !important",
                zoom: "85%" 
            },
            ".no-print, .MuiDataGrid-footerContainer, .MuiDataGrid-columnSeparator, .MuiDataGrid-pagination, .MuiDataGrid-scrollbar": { 
                display: "none !important" 
            },
            ".MuiDataGrid-root": { 
                height: "auto !important", 
                border: "none !important",
                width: "100% !important"
            },
            ".MuiDataGrid-main": { 
                overflow: "visible !important",
                width: "100% !important"
            },
            ".MuiDataGrid-virtualScroller": { 
                overflow: "visible !important", 
                height: "auto !important",
                width: "100% !important",
                position: "static !important"
            },
            ".MuiDataGrid-virtualScrollerContent": { 
                height: "auto !important", 
                width: "100% !important", 
                position: "static !important" 
            },
            ".MuiDataGrid-virtualScrollerRenderZone": { 
                position: "static !important", 
                display: "block !important",
                width: "100% !important"
            },
            ".MuiDataGrid-row": { 
                pageBreakInside: "avoid !important", 
                position: "static !important", 
                borderBottom: "1px solid #e0e0e0 !important",
                width: "100% !important",
                display: "flex !important"
            },
            ".MuiDataGrid-cell": {
                wordBreak: "break-word !important",
                whiteSpace: "normal !important",
                fontSize: "11px !important"
            },
            ".MuiDataGrid-columnHeaders": { 
                position: "static !important", 
                backgroundColor: "#f9f9f9 !important",
                width: "100% !important",
                display: "flex !important"
            }
        }
    }
};

const stringOperators = getGridStringOperators().filter((op) => 
    ['contains', 'equals', 'startsWith', 'endsWith'].includes(op.value)
);

const numericOperators = getGridNumericOperators()
  .filter((op) => ['=', '>', '>=', '<', '<='].includes(op.value))
  .map((op) => {
    const map = { '=': 'iexact', '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte' };
    return { ...op, backend: map[op.value] || op.value };
  });

const formatRegisterTime = (val) => {
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
                const blob = new Blob([response.data]);
                const objectUrl = URL.createObjectURL(blob);
                if (mounted) setImgSrc(objectUrl);
            } catch (err) { 
                console.error("Image Error:", err); 
            } finally { 
                if (mounted) setFetching(false); 
            }
        };
        fetchSecureImage();
        return () => { 
            mounted = false;
            if (imgSrc) URL.revokeObjectURL(imgSrc); 
        };
    }, [path]);

    return (
        <Avatar src={imgSrc} sx={styles} variant="rounded">
            {fetching ? <CircularProgress size={16} color="inherit" /> : firstName?.charAt(0)}
        </Avatar>
    );
};

function FarmerList() {
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
        user_name: "", password: "", confirm_password: "", first_name: "", 
        last_name: "", gender: "M", f_phone: "", state: "", 
        sub_district: "", address: "", aadhar_no: "", ekyf_id: "", 
        f_photo: null, deleted: 0
    });

    const effectiveFilterModel = useMemo(() => {
        if (searchText.trim() !== "") return { items: [] };
        if (!filterModel?.items || filterModel.items.length === 0) return filterModel;
        const mappedItems = filterModel.items.map((it) => {
            if (!it || !it.operator) return it;
            const numericOp = numericOperators.find(op => op.value === it.operator);
            if (numericOp && numericOp.backend) return { ...it, operator: numericOp.backend };
            return it;
        });
        return { ...filterModel, items: mappedItems };
    }, [filterModel, searchText]);

    const queryPayload = useMuiDrfQuery({
        paginationModel, 
        sortModel, 
        filterModel: effectiveFilterModel,
        searchValue: searchText, 
        searchField: "search", 
        refreshTrigger: refresh
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/farmer-api/farmer/', { params: queryPayload });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [queryPayload]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleClearSearch = () => {
        setSearchText("");
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handlePrintClick = () => {
        window.print();
    };

    // --- Strict Backend Validations Based on Models.py ---
    const validateForm = () => {
        let tempErrors = {};
        const usernameRegex = /^[\w.@+-]+$/;
        const ekyfRegex = /^[a-zA-Z]{2}[0-9]{12}$/;
        const phoneRegex = /^[0-9]{10,11}$/;
        const aadharRegex = /^[2-9]{1}[0-9]{11}$/;

        if (!formData.user_name) tempErrors.user_name = "Required.";
        else if (formData.user_name.length > 150) tempErrors.user_name = "Max 150 chars.";
        else if (!usernameRegex.test(formData.user_name)) tempErrors.user_name = "Letters, digits and @/./+/-/_ only.";

        if (!selectedId && !formData.password) tempErrors.password = "Required.";
        if (formData.password && formData.password !== formData.confirm_password) {
            tempErrors.confirm_password = "Passwords do not match.";
        }

        if (!formData.first_name) tempErrors.first_name = "Required.";
        else if (formData.first_name.length > 50) tempErrors.first_name = "Max 50 chars.";

        if (formData.last_name && formData.last_name.length > 50) tempErrors.last_name = "Max 50 chars.";

        if (!formData.f_phone) tempErrors.f_phone = "Required.";
        else if (!phoneRegex.test(formData.f_phone)) tempErrors.f_phone = "Enter a valid 10 or 11 digit Phone number.";

        if (!formData.aadhar_no) tempErrors.aadhar_no = "Required.";
        else if (!aadharRegex.test(formData.aadhar_no)) tempErrors.aadhar_no = "Invalid Adhaar card Number. (Starts with 2-9, 12 digits)";

        if (!formData.ekyf_id) tempErrors.ekyf_id = "Required.";
        else if (!ekyfRegex.test(formData.ekyf_id)) tempErrors.ekyf_id = "Enter Valid 14 digit ekyf ID";

        if (!formData.state) tempErrors.state = "Required.";
        if (!formData.sub_district) tempErrors.sub_district = "Required.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitLoading(true);
        
        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === "confirm_password" || key === "created_at" || key === "updated_at") return;
            if (selectedId && key === "password" && !formData[key]) return;
            if (key === "f_photo" && formData[key] instanceof File) {
                uploadData.append(key, formData[key]);
                return;
            }
            if (formData[key] !== null && formData[key] !== "" && key !== "f_photo") {
                uploadData.append(key, formData[key]);
            }
        });

        try {
            const url = selectedId ? `/farmer-api/farmer/${selectedId}/` : `/farmer-api/farmer/`;
            const response = await axiosInstance({
                method: selectedId ? 'patch' : 'post',
                url: url,
                data: uploadData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200 || response.status === 201) {
                setOpen(false);
                setRefresh(p => p + 1);
                resetForm();
            }
        } catch (err) { 
            if (err.response?.data) setErrors(err.response.data);
            console.error("Submit Error:", err); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.patch(`/farmer-api/farmer/${id}/`, { deleted: 1 });
            setRefresh(p => p + 1);
        } catch (err) { 
            console.error("Delete Error:", err); 
        }
    };

    const resetForm = () => {
        setFormData({
            user_name: "", password: "", confirm_password: "", first_name: "", 
            last_name: "", gender: "M", f_phone: "", state: "", 
            sub_district: "", address: "", aadhar_no: "", ekyf_id: "", 
            f_photo: null, deleted: 0
        });
        setPreview(null);
        setSelectedId(null);
        setErrors({});
    };

    const columns = useMemo(() => [
        { field: "f_id", headerName: "ID", width: 70, type: "number", filterOperators: numericOperators, filterable: true },
        { 
            field: "f_photo", 
            headerName: "PHOTO", 
            width: 80, 
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
            valueFormatter: (params) => {
                const val = typeof params === 'object' ? params.value : params;
                if (!val) return "-";
                return val === 'M' ? 'MALE' : 'FEMALE';
            }
        },
        { field: "f_phone", headerName: "PHONE", width: 120, type: "number", filterOperators: numericOperators },
        { field: "aadhar_no", headerName: "AADHAR", width: 140, type: "number", filterOperators: numericOperators },
        { field: "ekyf_id", headerName: "EKYF ID", width: 110, type: "number", filterOperators: numericOperators },
        { field: "state", headerName: "STATE", width: 110, filterOperators: stringOperators },
        { field: "sub_district", headerName: "SUB-DISTRICT", width: 120, filterOperators: stringOperators },
        { field: "address", headerName: "ADDRESS", width: 200, filterOperators: stringOperators },
        { 
            field: "created_at", 
            headerName: "REGISTER TIME", 
            width: 150,
            type: "date",
            valueFormatter: (params) => {
                const val = typeof params === 'object' ? params.value : params;
                return formatRegisterTime(val);
            }
        },
        {
            field: "actions", 
            headerName: "ACTIONS", 
            width: 100, 
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton 
                        sx={styles.editBtn} 
                        onClick={() => { 
                            setSelectedId(params.row.f_id); 
                            setFormData({...params.row, password: "", confirm_password: ""}); 
                            setOpen(true); 
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        sx={styles.deleteBtn} 
                        onClick={() => handleDelete(params.row.f_id)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ], []);

    return (
        <Box sx={styles.container}>
            <GlobalStyles styles={styles.printOverrides} />   

            <Box sx={styles.header} className="no-print">
                <Typography variant="h5" sx={styles.title}>FARMER DATA MANAGEMENT</Typography>
                <Box sx={styles.headerActions}>
                    <Button 
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintClick}
                        sx={styles.printBtn}
                    >
                        PRINT
                    </Button>
                    <TextField 
                        size="small"
                        placeholder="Search"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        sx={styles.searchField}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: searchText && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => { resetForm(); setOpen(true); }} 
                        sx={styles.addButton}
                    >
                        REGISTER FARMER
                    </Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox} className="print-area">
                <DataGrid
                    rows={rows} 
                    columns={columns} 
                    getRowId={(r) => r.f_id}
                    paginationMode="server" 
                    sortingMode="server"
                    filterMode="server"
                    rowCount={rowCount} 
                    paginationModel={paginationModel} 
                    onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel}
                    onFilterModelChange={setFilterModel}
                    pageSizeOptions={[10, 25, 50, 100]} 
                    loading={loading} 
                    autoHeight 
                    disableVirtualization 
                    sx={styles.dataGrid}
                    slots={{
                        toolbar: () => (
                            <GridToolbarContainer sx={{ display: 'none' }}>
                                <GridToolbarExport printOptions={{ disableToolbarButton: false }} />
                            </GridToolbarContainer>
                        ),
                    }}
                />
            </Box>

            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="md" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>
                    {selectedId ? "EDIT FARMER PROFILE" : "NEW FARMER REGISTRATION"}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3} sx={styles.photoUploadArea}>
                            <Avatar src={preview || (formData.f_photo && typeof formData.f_photo === 'string' ? formData.f_photo : null)} sx={styles.formAvatar} />
                            <Box>
                                <Button variant="outlined" component="label" sx={styles.uploadBtn}>
                                    SELECT IMAGE
                                    <input type="file" hidden accept="image/*" onChange={(e) => { 
                                        const file = e.target.files[0]; 
                                        if (file) {
                                            setFormData({...formData, f_photo: file}); 
                                            setPreview(URL.createObjectURL(file)); 
                                        }
                                    }} /> 
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Username *" size="small" 
                                        error={!!errors.user_name} helperText={errors.user_name}
                                        value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="password" label="Password *" size="small" 
                                        error={!!errors.password} helperText={errors.password}
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth type="password" label="Confirm Password *" size="small" 
                                        error={!!errors.confirm_password} helperText={errors.confirm_password}
                                        value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="First Name *" size="small" 
                                        error={!!errors.first_name} helperText={errors.first_name}
                                        value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Last Name" size="small" 
                                        error={!!errors.last_name} helperText={errors.last_name}
                                        value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Phone *" size="small" 
                                        error={!!errors.f_phone} helperText={errors.f_phone}
                                        value={formData.f_phone} onChange={e => setFormData({...formData, f_phone: e.target.value})} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Aadhar No *" size="small" 
                                        error={!!errors.aadhar_no} helperText={errors.aadhar_no}
                                        value={formData.aadhar_no} onChange={e => setFormData({...formData, aadhar_no: e.target.value})} />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl fullWidth size="small" error={!!errors.gender}>
                                        <InputLabel>Gender</InputLabel>
                                        <Select label="Gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                            <MenuItem value="M">MALE</MenuItem>
                                            <MenuItem value="F">FEMALE</MenuItem>
                                        </Select>
                                        {errors.gender && <Typography variant="caption" color="error">{errors.gender}</Typography>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth label="State *" size="small" 
                                        error={!!errors.state} helperText={errors.state}
                                        value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth label="Sub-District *" size="small" 
                                        error={!!errors.sub_district} helperText={errors.sub_district}
                                        value={formData.sub_district} onChange={e => setFormData({...formData, sub_district: e.target.value})} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="EKYF ID *" size="small" 
                                        error={!!errors.ekyf_id} helperText={errors.ekyf_id}
                                        value={formData.ekyf_id} onChange={e => setFormData({...formData, ekyf_id: e.target.value})} />
                                </Grid>
                                <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Address" size="small" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit">CANCEL</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : (selectedId ? "Save" : "ADD")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FarmerList;