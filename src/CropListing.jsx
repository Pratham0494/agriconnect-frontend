import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirection
import { 
    DataGrid, 
    getGridNumericOperators, 
    getGridStringOperators, 
    getGridSingleSelectOperators 
} from "@mui/x-data-grid";
import {
    Box, TextField, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, MenuItem, IconButton, Typography, Select,
    FormControl, InputLabel, GlobalStyles, InputAdornment, Autocomplete, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIconDefault from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import GavelIcon from "@mui/icons-material/Gavel"; // Icon for Bidding

import axiosInstance from "./api/axios"; 
import { useMuiDrfQuery } from "./hooks/useMuiDrfQuery"; 

const styles = {
    container: { padding: "40px", backgroundColor: "#ffffff", minHeight: "100vh" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    title: { 
        fontWeight: "900", color: "#1b5e20", borderLeft: "6px solid #2e7d32", 
        paddingLeft: "16px", textTransform: "uppercase", letterSpacing: "1px"
    },
    printBtn: { 
        color: "#2e7d32", fontWeight: "900", border: "2px solid #2e7d32", 
        borderRadius: "2px", height: "40px",
        "&:hover": { border: "2px solid #1b5e20", backgroundColor: "rgba(46, 125, 50, 0.04)" }
    },
    bidBtn: { 
        color: "#2e7d32", fontWeight: "900", border: "2px solid #2e7d32", 
        borderRadius: "2px", height: "40px",
        "&:hover": { border: "2px solid #1b5e20", backgroundColor: "rgba(21, 101, 192, 0.04)" }
    },
    addButton: { 
        backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "800", 
        borderRadius: "2px", height: "40px", minWidth: "220px",
        "&:hover": { backgroundColor: "#1b5e20" }
    },
    gridBox: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "4px", backgroundColor: "#fff" },
    dataGrid: { 
        border: "none", 
        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9f9f9", color: "#1b5e20", fontWeight: "900", fontSize: "0.85rem" },
        "& .MuiDataGrid-cell": { fontSize: "0.85rem", borderBottom: "1px solid #f0f0f0" }
    },
    saveBtn: { 
        backgroundColor: "#2e7d32", color: "#ffffff", fontWeight: "900", 
        minWidth: "160px", borderRadius: "2px", "&:hover": { backgroundColor: "#1b5e20" } 
    },
    searchField: { 
        backgroundColor: "#f5f5f5", borderRadius: "4px", width: "350px",
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid #2e7d32" }
    },
    dialogTitle: { fontWeight: "900", color: "#1b5e20", fontSize: "1.4rem", borderBottom: "1px solid #eee", textAlign: 'center', paddingTop: "24px" },
    selectionHeaderArea: { 
        display: "flex", justifyContent: "center", marginBottom: "32px", 
        marginTop: "16px", padding: "24px", backgroundColor: "#fcfcfc", border: "1px solid #eee", borderRadius: "8px" 
    },
    selectionBox: { width: "100%", maxWidth: "600px" },
    selectionLabel: { fontWeight: "900", color: "#2e7d32", marginBottom: "8px", fontSize: "0.85rem", textAlign: "center", textTransform: "uppercase" },
    optionWrapper: { display: "flex", flexDirection: "column", width: "100%", padding: "8px 0" },
    optionText: { fontSize: "0.9rem", fontWeight: "600", color: "#333" },
    printOverrides: {
        "@media print": {
            "nav, aside, footer, .no-print, button, .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer": { display: "none !important" },
            "@page": { size: "landscape", margin: "10mm" },
            ".MuiBox-root": { padding: "0 !important", margin: "0 !important", boxShadow: "none !important" },
            ".MuiDataGrid-root": { border: "1px solid #ccc !important", height: "auto !important", width: "100% !important" },
            "body": { zoom: "85%" }
        }
    }
};

const numericOperators = getGridNumericOperators().filter(
    (op) => ['=', '!=', '>', '>=', '<', '<='].includes(op.value)
);

const stringOperators = getGridStringOperators().filter(
    (op) => ['contains', 'equals', 'startsWith', 'endsWith'].includes(op.value)
);

const singleSelectOperators = getGridSingleSelectOperators().filter(
    (op) => op.value === 'is'
);

const CropListing = () => {
    const navigate = useNavigate(); // Hook for navigation
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stockDetailsList, setStockDetailsList] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] }); 
    const [searchText, setSearchText] = useState("");

    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        stock_detail: "",
        category: "Grains",
        variety: "",
        qty_available: "",
        unit: "kg",
        min_order_quantity: "",
        price_per_unit: "",
        harvest_date: "",
        location_warehouse: "",
        status: "O"
    });

    const queryParams = useMuiDrfQuery({
        paginationModel,
        sortModel,
        filterModel, 
        searchValue: searchText,
        searchField: "search",
        refreshTrigger
    });

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('farmer-api/listing/', { params: queryParams });
            setRows(response.data.results || []);
            setTotalRows(response.data.count || 0);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    const loadStockDependencies = useCallback(async () => {
        try {
            const stockRes = await axiosInstance.get('farmer-api/stock-detail/');
            setStockDetailsList(stockRes.data.results || stockRes.data || []);
        } catch (err) {
            console.error("Stock load error:", err);
        }
    }, []);

    useEffect(() => {
        fetchListings();
        loadStockDependencies();
    }, [fetchListings, loadStockDependencies]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedId) {
                await axiosInstance.put(`farmer-api/listing/${selectedId}/`, formData);
            } else {
                await axiosInstance.post('farmer-api/listing/', formData);
            }
            setRefreshTrigger(p => p + 1);
            setOpen(false);
            resetForm();
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this listing?")) {
            try {
                await axiosInstance.delete(`farmer-api/listing/${id}/`);
                setRefreshTrigger(p => p + 1);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const resetForm = () => {
        setFormData({ 
            stock_detail: "", category: "Grains", variety: "", qty_available: "", 
            unit: "kg", min_order_quantity: "", price_per_unit: "", 
            harvest_date: "", location_warehouse: "", status: "O" 
        });
        setSelectedId(null);
    };

    const columns = [
        { 
            field: "l_id", 
            headerName: "ID", 
            width: 70, 
            type: "number",
            filterOperators: numericOperators
        },
        { 
            field: "crop_name", 
            headerName: "CROP", 
            width: 160, 
            type: "string",
            filterOperators: stringOperators
        },
        { 
            field: "farmer_name", 
            headerName: "FARMER", 
            width: 180, 
            type: "string",
            filterOperators: stringOperators
        },
        { 
            field: "qty_available", 
            headerName: "QTY FOR SALE", 
            width: 150, 
            type: "number",
            filterOperators: numericOperators,
            renderCell: (p) => `${p?.value ?? 0} ${p?.row?.unit || 'kg'}` 
        },
        { 
            field: "price_per_unit", 
            headerName: "PRICE", 
            width: 120, 
            type: "number",
            filterOperators: numericOperators,
            renderCell: (p) => `₹${p?.value ?? 0}` 
        },
        { 
            field: "status", 
            headerName: "STATUS", 
            width: 130,
            type: "singleSelect",
            filterOperators: singleSelectOperators,
            valueOptions: [
                { value: 'O', label: 'OPEN' },
                { value: 'R', label: 'RESERVED' },
                { value: 'S', label: 'SOLD' }
            ],
            renderCell: (p) => {
                const config = { 'O': { l: 'OPEN', c: 'success' }, 'R': { l: 'RESERVED', c: 'warning' }, 'S': { l: 'SOLD', c: 'error' } };
                const status = config[p?.value] || { l: p?.value || 'N/A', c: 'default' };
                return <Chip label={status.l} color={status.c} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
            }
        },
        {
            field: "actions", 
            headerName: "ACTIONS", 
            width: 120, 
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box className="no-print">
                    <IconButton color="primary" onClick={() => { 
                        setSelectedId(params.row.l_id); 
                        setFormData({ 
                            ...params.row, 
                            stock_detail: params.row.stock_detail?.id || params.row.stock_detail_id || params.row.stock_detail 
                        }); 
                        setOpen(true); 
                    }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.l_id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={styles.container}>
            <GlobalStyles styles={styles.printOverrides} />
            
            <Box sx={styles.header}>
                <Typography variant="h4" sx={styles.title}>CROP LISTING MANAGEMENT</Typography>
                <Box sx={{ display: "flex", gap: "16px" }} className="no-print">
                    {/* REDIRECT TO BIDDING BUTTON */}
                    <Button 
                        variant="outlined" 
                        startIcon={<GavelIcon />} 
                        sx={styles.bidBtn} 
                        onClick={() => navigate("/admin-dashboard/wholesaler-bidding/1")}
                    >
                        BIDDING
                    </Button>

                    <Button variant="outlined" startIcon={<PrintIconDefault />} sx={styles.printBtn} onClick={() => window.print()}>PRINT</Button>
                    
                    <TextField
                        size="small" placeholder="Search crop, farmer, or status..." sx={styles.searchField} 
                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#2e7d32" }} /></InputAdornment>,
                            endAdornment: searchText && <IconButton onClick={() => setSearchText("")}><ClearIcon fontSize="small"/></IconButton>
                        }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} sx={styles.addButton} onClick={() => { resetForm(); setOpen(true); }}>LIST NEW CROP</Button>
                </Box>
            </Box>

            <Box sx={styles.gridBox}>
                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    getRowId={(row) => row.l_id}
                    rowCount={totalRows} 
                    loading={loading} 
                    paginationMode="server"
                    sortingMode="server"
                    filterMode="server" 
                    paginationModel={paginationModel} 
                    onPaginationModelChange={setPaginationModel}
                    onSortModelChange={setSortModel} 
                    filterModel={filterModel}
                    onFilterModelChange={(newModel) => setFilterModel(newModel)} 
                    pageSizeOptions={[10, 25, 50, 100]}
                    autoHeight 
                    sx={styles.dataGrid}
                    disableRowSelectionOnClick
                />
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={styles.dialogTitle}>{selectedId ? "EDIT CROP LISTING" : "ADD NEW CROP LISTING"}</DialogTitle>
                <DialogContent dividers sx={{ p: 4 }}>
                    
                    <Box sx={styles.selectionHeaderArea}>
                        <Box sx={styles.selectionBox}>
                            <Typography sx={styles.selectionLabel}>STOCK DETAIL ID</Typography>
                            <Autocomplete
                                options={stockDetailsList}
                                getOptionLabel={(option) => `${option.crop_name || "Crop"} - Farmer: ${option.farmer_name || "Unknown"} (ID: ${option.id || option.stock_id})`}
                                value={stockDetailsList.find(s => (s.id || s.stock_id) === (formData.stock_detail?.id || formData.stock_detail)) || null}
                                onChange={(_, val) => {
                                    if (val) {
                                        setFormData({
                                            ...formData, 
                                            stock_detail: val.id || val.stock_id,
                                            category: val.category || formData.category,
                                            variety: val.variety || "",
                                            unit: val.unit || "kg",
                                            price_per_unit: val.price_per_unit || "",
                                            harvest_date: val.harvested_date || "",
                                            location_warehouse: val.stored_location || val.location || ""
                                        });
                                    } else {
                                        resetForm();
                                    }
                                }}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={styles.optionWrapper}>
                                        <Typography sx={styles.optionText}>
                                            {option.crop_name} ({option.quantity} {option.unit} available)
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Farmer: {option.farmer_name} | Stock ID: {option.id || option.stock_id}
                                        </Typography>
                                    </Box>
                                )}
                                renderInput={(params) => <TextField {...params} label="Search Stock Detail ID *" size="small" required />}
                            />
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select name="category" value={formData.category} onChange={handleChange} label="Category">
                                    <MenuItem value="Grains">Grains</MenuItem>
                                    <MenuItem value="Vegetables">Vegetables</MenuItem>
                                    <MenuItem value="Fruits">Fruits</MenuItem>
                                    <MenuItem value="Spices">Spices</MenuItem>
                                    <MenuItem value="Pulses">Pulses</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField fullWidth name="variety" label="Variety" size="small" value={formData.variety} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField 
                                fullWidth name="qty_available" label="Quantity for Sale" size="small" type="number" 
                                value={formData.qty_available} onChange={handleChange}
                                helperText="Cannot exceed total stock quantity"
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Unit</InputLabel>
                                <Select name="unit" value={formData.unit} onChange={handleChange} label="Unit">
                                    <MenuItem value="kg">kg</MenuItem>
                                    <MenuItem value="TON">TON</MenuItem>
                                    <MenuItem value="Quintal">Quintal</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            <TextField fullWidth name="min_order_quantity" label="Min Order Qty" size="small" type="number" value={formData.min_order_quantity} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField 
                                fullWidth name="price_per_unit" label="Price per Unit" size="small" type="number" 
                                value={formData.price_per_unit} onChange={handleChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField fullWidth name="harvest_date" label="Harvest Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={formData.harvest_date} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField fullWidth name="location_warehouse" label="Location / Warehouse" size="small" value={formData.location_warehouse} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Listing Status</InputLabel>
                                <Select name="status" value={formData.status} onChange={handleChange} label="Listing Status">
                                    <MenuItem value="O">Open (Active on Market)</MenuItem>
                                    <MenuItem value="R">Reserved</MenuItem>
                                    <MenuItem value="S">Sold</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: "bold", color: "#666" }}>CANCEL</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={styles.saveBtn} disabled={!formData.stock_detail}>CONFIRM LISTING</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CropListing;