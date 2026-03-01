import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    DataGrid, 
    getGridStringOperators, 
    getGridNumericOperators,
    getGridDateOperators
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, IconButton, Typography, CircularProgress, 
    InputAdornment, GlobalStyles, Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery";

// --- STRICT OPERATOR SELECTION ---
const stringOperators = getGridStringOperators()
    .filter((op) => ['equals', 'contains', 'startsWith', 'endsWith'].includes(op.value));

const numericOperators = getGridNumericOperators()
    .filter((op) => ['=', '>', '>=', '<', '<='].includes(op.value));

const dateOperators = getGridDateOperators()
    .filter((op) => ['is', 'after', 'before'].includes(op.value));

const formatRegisterTime = (val) => {
    if (!val) return "-";
    const date = new Date(val);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const AuthorizedAvatar = ({ path, name, styles }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!path) return;
        const fetchSecureImage = async () => {
            setFetching(true);
            try {
                const response = await axiosInstance.get(path, { responseType: 'blob' });
                const objectUrl = URL.createObjectURL(response.data);
                setImgSrc(objectUrl);
            } catch (err) { 
                console.error("Image Error:", err); 
            } finally { 
                setFetching(false); 
            }
        };
        fetchSecureImage();
        return () => { if (imgSrc) URL.revokeObjectURL(imgSrc); };
    }, [path]);

    return (
        <Avatar src={imgSrc} sx={styles} variant="rounded">
            {fetching ? <CircularProgress size={16} color="inherit" /> : name?.charAt(0)}
        </Avatar>
    );
};

function CropList() {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [preview, setPreview] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        crop_id: "", crop_name: "", crop_variety: "", photo: null, 
        description: "", deleted: false
    });

    const effectiveFilterModel = useMemo(() => {
        if (searchText.trim() !== "") return { items: [] }; 
        return filterModel;
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
            const response = await axiosInstance.get('admin-api/crop/', { params: queryPayload });
            setRows(response.data.results || []);
            setRowCount(response.data.count || 0);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [queryPayload]);

    useEffect(() => { loadData(); }, [loadData]);

    const resetForm = () => {
        setFormData({ 
            crop_id: "", crop_name: "", crop_variety: "", photo: null, 
            description: "", deleted: false
        });
        setPreview(null);
        setSelectedId(null);
    };

    const columns = useMemo(() => [
        { 
            field: "crop_id", 
            headerName: "ID", 
            width: 80, 
            type: "number", 
            filterOperators: numericOperators 
        },
        { 
            field: "photo", 
            headerName: "PHOTO", 
            width: 100, 
            filterable: false,
            renderCell: (p) => <AuthorizedAvatar path={p.value} name={p.row?.crop_name} styles={styles.gridAvatar} /> 
        },
        { 
            field: "crop_name", 
            headerName: "CROP NAME", 
            width: 180, 
            type: "string",
            filterOperators: stringOperators 
        },
        { 
            field: "crop_variety", 
            headerName: "VARIETY", 
            width: 150, 
            type: "string",
            filterOperators: stringOperators 
        },
        { 
            field: "description", 
            headerName: "DESCRIPTION", 
            width: 250, 
            type: "string",
            filterOperators: stringOperators 
        },
        { 
            field: "created_at", 
            headerName: "REGISTER TIME", 
            width: 180,
            type: "date",
            filterOperators: dateOperators,
            valueFormatter: (params) => {
                const val = typeof params === 'object' ? params.value : params;
                return formatRegisterTime(val);
            }
        },
        {
            field: "actions", 
            headerName: "ACTIONS", 
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={styles.actionBox} className="no-print">
                    <IconButton sx={styles.editBtn} onClick={() => { 
                        setSelectedId(params.row.crop_id); 
                        setFormData({ ...params.row }); 
                        setPreview(params.row.photo); 
                        setOpen(true); 
                    }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={styles.deleteBtn} onClick={() => handleDelete(params.row.crop_id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ], []);

    const handleSave = async () => {
        setSubmitLoading(true);
        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === "created_at" || key === "updated_at") return;
            if (key === "photo") {
                if (formData[key] instanceof File) uploadData.append(key, formData[key]);
                return;
            }
            if (formData[key] !== null && formData[key] !== "") {
                uploadData.append(key, formData[key]);
            }
        });

        try {
            const url = selectedId ? `admin-api/crop/${selectedId}/` : `admin-api/crop/`;
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
            console.error("Save Error:", err.response?.data);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.patch(`admin-api/crop/${id}/`, { deleted: true });
            setRefresh(p => p + 1);
        } catch (err) { 
            console.error("Delete Error:", err); 
        }
    };

    return (
        <Box sx={styles.container} className="print-area">
            <GlobalStyles styles={styles.globalStyles} />

            <Box sx={styles.header}>
                <Typography variant="h5" sx={styles.title}>CROP MANAGEMENT</Typography>
                <Box sx={styles.headerActions} className="no-print">
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={styles.printBtn}>PRINT</Button>
                    <TextField 
                        size="small" placeholder="Search..." value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        sx={styles.searchField}
                        InputProps={{ 
                            startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                            endAdornment: searchText && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setSearchText(""); setPaginationModel(p => ({...p, page: 0})); }}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpen(true); }} sx={styles.addButton}>REGISTER NEW CROP</Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox}>
                <DataGrid
                    rows={rows} columns={columns} getRowId={(row) => row.crop_id}
                    loading={loading} autoHeight paginationMode="server"
                    sortingMode="server" filterMode="server"
                    rowCount={rowCount} paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel}
                    onFilterModelChange={setFilterModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    sx={styles.dataGrid}
                    disableVirtualization
                />
            </Box>

            <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} maxWidth="sm" fullWidth className="no-print">
                <DialogTitle sx={styles.modalTitle}>{selectedId ? "EDIT CROP RECORD" : "NEW CROP REGISTRATION"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sx={styles.photoUploadArea}>
                            <Avatar src={preview || (formData.photo && typeof formData.photo === 'string' ? formData.photo : null)} sx={styles.formAvatar} variant="rounded" />
                            <Button variant="outlined" component="label" sx={styles.uploadBtn}>
                                SELECT IMAGE
                                <input type="file" hidden accept="image/*" onChange={(e) => { 
                                    const file = e.target.files[0]; 
                                    if (file) {
                                        setFormData({...formData, photo: file}); 
                                        setPreview(URL.createObjectURL(file)); 
                                    }
                                }} />
                            </Button>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Crop Name *" size="small" value={formData.crop_name} onChange={(e) => setFormData({...formData, crop_name: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Variety *" size="small" value={formData.crop_variety} onChange={(e) => setFormData({...formData, crop_variety: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Description" size="small" multiline rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button onClick={() => setOpen(false)} color="inherit">CANCEL</Button>
                    <Button variant="contained" onClick={handleSave} sx={styles.saveBtn} disabled={submitLoading}>
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "SAVE"}
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
    searchField: { width: "350px", backgroundColor: "#f9f9f9" },
    printBtn: { color: "#2e7d32", fontWeight: "900", border: "1px solid #2e7d32", height: "40px", minWidth: "120px", borderRadius: "2px" },
    addButton: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "800", height: "40px", minWidth: "220px", borderRadius: "2px" },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "4px" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", fontWeight: "900" },
        "& .MuiDataGrid-filterForm": { padding: "16px" }
    },
    gridAvatar: { width: "44px", height: "44px", borderRadius: "4px" },
    actionBox: { display: "flex", gap: "4px" },
    editBtn: { color: "#1976d2" },
    deleteBtn: { color: "#d32f2f" },
    modalTitle: { fontWeight: "900", color: "#1b5e20" },
    photoUploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
    formAvatar: { width: "120px", height: "120px", border: "2px solid #e0e0e0" },
    uploadBtn: { fontSize: "11px", fontWeight: "900", color: "#2e7d32", borderColor: "#2e7d32" },
    dialogActions: { padding: "16px", justifyContent: "flex-end", gap: "8px" },
    saveBtn: { backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", minWidth: "160px" },
    globalStyles: {
        "@media print": {
            "@page": { 
                size: "landscape", 
                margin: "10mm" 
            },
            "html, body": {
                zoom: "85%",
                backgroundColor: "#fff !important"
            },
            "body *": { 
                visibility: "hidden", 
                overflow: "visible !important" 
            },
            ".print-area, .print-area *": { 
                visibility: "visible" 
            },
            ".print-area": { 
                position: "absolute", 
                left: 0, 
                top: 0, 
                width: "100%", 
                margin: 0, 
                padding: "0px !important" 
            },
            // Strictly hide header actions, pagination footer, and selection count
            ".no-print, .MuiDataGrid-footerContainer, .MuiDataGrid-selectedRowCount": { 
                display: "none !important" 
            },
            ".MuiDataGrid-main, .MuiDataGrid-virtualScroller": { 
                overflow: "visible !important", 
                height: "auto !important" 
            },
            ".MuiDataGrid-columnHeaders, .MuiDataGrid-row": {
                borderBottom: "1px solid #eee !important"
            }
        }
    }
};

export default CropList;