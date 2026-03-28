import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, TextField, Button, IconButton, 
    Paper, InputAdornment, Avatar, Chip, Dialog, 
    DialogTitle, DialogContent, DialogActions, Grid, MenuItem 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'; 
import { 
    Search as SearchIcon, 
    Print as PrintIcon, 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { useMuiDrfQuery } from './hooks/useMuiDrfQuery'; 

// --- SUB-COMPONENT: ADD ORDER DIALOG ---
const AddOrderDialog = ({ open, onClose, onSave }) => {
    const [biddings, setBiddings] = useState([]);
    const [formData, setFormData] = useState({
        b_id: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'Pending Payment',
        price_per_unit: '',
        delivery_date: ''
    });

    useEffect(() => {
        if (open) {
            axios.get('/api/wholesaler/biddings/', { params: { status: 'A' } })
                .then(res => setBiddings(res.data.results || []))
                .catch(err => console.error("Error loading biddings", err));
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'b_id') {
            const selectedBid = biddings.find(b => b.b_id === value);
            if (selectedBid) {
                setFormData(prev => ({ ...prev, b_id: value, price_per_unit: selectedBid.price_per_unit }));
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold', color: '#2E7D32', borderBottom: '1px solid #eee' }}>
                Add Wholesale Order
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    {/* BIG VISIBLE BIDDING ID FIELD */}
                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray', ml: 1 }}>
                            LINK TO BIDDING ID
                        </Typography>
                        <TextField 
                            select fullWidth 
                            name="b_id" 
                            value={formData.b_id} 
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="Select Bidding ID"
                            sx={{ 
                                mt: 0.5,
                                '& .MuiOutlinedInput-root': { 
                                    height: '55px', 
                                    fontSize: '1.1rem', 
                                    fontWeight: 'bold' 
                                } 
                            }}
                        >
                            {biddings.map((bid) => (
                                <MenuItem key={bid.b_id} value={bid.b_id} sx={{ py: 1.5 }}>
                                   <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            ID: {bid.b_id} — {bid.crop_name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Bidder: {bid.bidder_name}
                                        </Typography>
                                   </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <TextField 
                            fullWidth label="Price Per Unit" name="price_per_unit" 
                            type="number" value={formData.price_per_unit} onChange={handleChange} 
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            select fullWidth label="Status" name="status" 
                            value={formData.status} onChange={handleChange}
                            sx={{ mt: 1 }}
                        >
                            <MenuItem value="Pending Payment">Pending Payment</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Review">Under Review</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            fullWidth label="Order Date" name="order_date" type="date" 
                            InputLabelProps={{ shrink: true }} value={formData.order_date} onChange={handleChange} 
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            fullWidth label="Delivery Date" name="delivery_date" type="date" 
                            InputLabelProps={{ shrink: true }} value={formData.delivery_date} onChange={handleChange} 
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ color: 'gray', fontWeight: 'bold' }}>CANCEL</Button>
                <Button 
                    onClick={() => onSave(formData)} 
                    variant="contained" sx={{ bgcolor: '#2E7D32', px: 4, fontWeight: 'bold' }}
                >CREATE ORDER</Button>
            </DialogActions>
        </Dialog>
    );
};

// --- MAIN COMPONENT: WHOLESALER ORDERS ---
const WholesalerOrders = () => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [searchValue, setSearchValue] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);

    const queryParams = useMuiDrfQuery({
        paginationModel, sortModel, filterModel, searchValue, searchField: "search"
    });

    const handlePrint = () => {
        window.print();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/wholesaler/orders/', { params: queryParams });
            setRows(res.data.results || []);
            setTotalRows(res.data.count || 0);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [queryParams]);

    const handleSaveOrder = async (data) => {
        try {
            await axios.post('/api/wholesaler/orders/', data);
            setIsDialogOpen(false);
            fetchData();
        } catch (err) { alert("Failed to create order"); }
    };

    const columns = [
        { field: 'o_id', headerName: 'ID', width: 80 },
        {
            field: 'bidder_name',
            headerName: 'WHOLESALER / BUSINESS',
            flex: 1.5,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#4CAF50', width: 32, height: 32 }}>{params.value?.charAt(0) || 'W'}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value} / {params.row.o_id}</Typography>
                </Box>
            ),
        },
        {
            field: 'crop_name',
            headerName: 'CROP ASSOCIATION',
            flex: 1.2,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar variant="rounded" sx={{ bgcolor: '#E8F5E9', color: '#4CAF50', width: 28, height: 28 }}>{params.value?.charAt(0) || 'C'}</Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>{params.value?.toUpperCase()} / {params.row.b_id}</Typography>
                </Box>
            ),
        },
        {
            field: 'order_date',
            headerName: 'REGISTERED DATE',
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'Short', year: 'numeric' })
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            renderCell: (params) => (<Chip label={params.value} size="small" variant="outlined" color="success" sx={{ fontWeight: 'bold' }} />)
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 100,
            sortable: false,
            renderCell: () => (
                <Box sx={{ display: 'flex', gap: 0.5 }} className="no-print">
                    <IconButton size="small" sx={{ color: '#42a5f5', bgcolor: '#e3f2fd' }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#ef5350', bgcolor: '#ffebee' }}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#ffffff', minHeight: '100vh' }} className="printable-area">
            {/* Print Header */}
            <Box className="print-header-only" sx={{ display: 'none', mb: 3, borderBottom: '2px solid #2E7D32', pb: 1 }}>
                <Typography variant="h4" sx={{ color: '#1B5E20', fontWeight: 'bold' }}>AGRICONNECT - Wholesaler Orders Report</Typography>
                <Typography variant="body2">Generated on: {new Date().toLocaleString()}</Typography>
            </Box>

            {/* UI Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }} className="no-print">
                <Box sx={{ borderLeft: '5px solid #2E7D32', pl: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B5E20', lineHeight: 1.1 }}>
                        WHOLESALER <br /> ORDERS
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ color: '#1B5E20', borderColor: '#e0e0e0', height: '48px', fontWeight: 'bold' }}>PRINT PDF</Button>
                    <TextField placeholder="Global Search..." size="small" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} sx={{ width: 280, '& .MuiOutlinedInput-root': { height: '48px' } }} InputProps={{ endAdornment: (<InputAdornment position="end"><SearchIcon /></InputAdornment>) }} />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsDialogOpen(true)} sx={{ bgcolor: '#2E7D32', height: '48px', px: 3, fontWeight: 'bold' }}>ADD WHOLESALE ORDER</Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', mt: 2 }}>
                <DataGrid
                    rows={rows} columns={columns} getRowId={(row) => row.o_id}
                    rowCount={totalRows} loading={loading}
                    paginationMode="server" sortingMode="server"
                    paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]} autoHeight
                    sx={{ border: 'none' }}
                />
            </Paper>

            <AddOrderDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSaveOrder} />

            <style>
                {`
                @media print {
                    nav, aside, .no-print, button, .MuiInputBase-root, header, .MuiDataGrid-footerContainer { display: none !important; }
                    .print-header-only { display: block !important; }
                    body, html { width: 100%; margin: 0 !important; padding: 0 !important; }
                    .printable-area { position: absolute; left: 0; top: 0; width: 100% !important; padding: 20px !important; margin: 0 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
        </Box>
    );
};

export default WholesalerOrders;