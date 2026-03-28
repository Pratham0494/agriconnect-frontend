import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
// IMPORT getCookie from your axios file to stay synchronized
import { getCookie } from './api/axios';  
import {
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Button, 
    TextField, InputAdornment, Alert, Snackbar, Divider
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";

/**
 * CLEAN CONST STYLE CSS
 */
const STYLES = {
    container: { padding: "30px", backgroundColor: "#f4f6f8", minHeight: "100vh" },
    paper: { padding: "25px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" },
    header: { 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 3,
        flexWrap: "wrap",
        gap: 2
    },
    title: { fontWeight: 800, color: "#2c3e50", letterSpacing: "0.5px" },
    // Input section moved to header with specialized styling
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: 2
    },
    topInputSection: { 
        display: "flex", 
        gap: 1, 
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "8px",
    },
    tableContainer: { 
        mt: 1, 
        border: "1px solid #eceff1", 
        borderRadius: "8px",
        height: "600px", // Increased height since bottom bar is gone
        overflowY: "auto",
        backgroundColor: "#ffffff"
    },
    tableHead: { 
        backgroundColor: "#2e7d32", 
        position: "sticky",
        top: 0,
        zIndex: 2
    },
    headerCell: { 
        fontWeight: 700, 
        color: "#ffffff", 
        textTransform: "uppercase", 
        fontSize: "0.75rem",
        borderBottom: "none",
        backgroundColor: "#2e7d32"
    },
    priceCell: { fontWeight: 900, color: "#1b5e20", fontSize: "1.05rem" },
    qtyCell: { color: "#455a64", fontWeight: 600 },
    myBidRow: { 
        backgroundColor: "#e8f5e9", 
        borderLeft: "5px solid #4caf50",
        transition: "background-color 0.3s ease" 
    },
    emptyRow: { height: "52px" },
    bidButton: { 
        px: 3, py: 1, fontWeight: 700, 
        backgroundColor: "#2e7d32", "&:hover": { backgroundColor: "#1b5e20" } 
    }
};

const BiddingPortal = () => {
    const { l_id } = useParams(); 
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const socket = useRef(null);

    const currentWholesalerId = localStorage.getItem("w_id");
    const MIN_ROWS = 10; 

    useEffect(() => {
        const token = getCookie("access_token");

        if (!l_id || l_id === "undefined") {
            setErrorMsg("Invalid Auction ID. Please return to Stock Listing.");
            return;
        }

        if (!token) {
            setErrorMsg("Session expired. Please log in again.");
            return;
        }

        const wsUrl = `ws://127.0.0.1:8000/ws/bidding/${l_id}/?token=${token}&role=wholesaler`;
        
        socket.current = new WebSocket(wsUrl);

        socket.current.onopen = () => {
            console.log("Connected to Bidding System");
            setErrorMsg(null);
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.success === false) {
                setErrorMsg(data.message);
                return;
            }

            switch (data.type) {
                case "initial_bids":
                    setBids(data.bids);
                    break;

                case "bid_added":
                    setBids((prev) => {
                        if (prev.find(b => b.b_id === data.b_id)) return prev;
                        const newList = [data, ...prev];
                        return newList.sort((a, b) => parseFloat(b.price_per_unit_str) - parseFloat(a.price_per_unit_str));
                    });
                    break;

                case "bid_updated":
                    setBids((prev) => prev.map(b => b.b_id === data.b_id ? { ...b, ...data } : b));
                    break;

                case "bid_deleted":
                    setBids((prev) => prev.filter(b => b.b_id !== data.b_id));
                    break;

                case "bid_closed":
                    setErrorMsg("Bidding for this item has been closed.");
                    break;

                default:
                    console.log("Unknown socket event:", data.type);
            }
        };

        socket.current.onerror = () => {
            setErrorMsg("Connection error. Ensure your backend and Redis are running.");
        };

        socket.current.onclose = () => {
            console.log("WebSocket Disconnected");
        };

        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, [l_id]);

    const handlePlaceBid = () => {
        if (!bidAmount || isNaN(bidAmount)) return;

        const payload = {
            action: "add_bid",
            price_per_unit_str: bidAmount.toString()
        };

        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(payload));
            setBidAmount("");
        } else {
            setErrorMsg("Cannot place bid: Not connected to server.");
        }
    };

    const emptyRowsCount = Math.max(0, MIN_ROWS - bids.length);

    return (
        <Box sx={STYLES.container}>
            <Paper sx={STYLES.paper}>
                {/* TOP HEADER SECTION WITH INPUTS */}
                <Box sx={STYLES.header}>
                    <Box>
                        <Typography variant="h5" sx={STYLES.title}>
                            Real-Time Auction Portal
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {bids.length} Total Bids Placed
                        </Typography>
                    </Box>

                    <Box sx={STYLES.headerActions}>
                        {/* THE BID INPUT SECTION NOW AT THE TOP */}
                        <Box sx={STYLES.topInputSection}>
                            <TextField 
                                label="Place New Bid"
                                variant="outlined"
                                size="small"
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePlaceBid()}
                                sx={{ width: '180px' }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                            />
                            <Button 
                                variant="contained" 
                                color="success"
                                startIcon={<GavelIcon />}
                                sx={STYLES.bidButton}
                                onClick={handlePlaceBid}
                                disabled={!bidAmount}
                            >
                                Submit Bid
                            </Button>
                        </Box>

                        <Chip 
                            icon={<TrendingUpIcon />} 
                            label="LIVE" 
                            color="success" 
                            variant="outlined" 
                            sx={{ fontWeight: 700, borderRadius: '4px', height: '40px' }} 
                        />
                    </Box>
                </Box>

                <Divider />

                <TableContainer sx={STYLES.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={STYLES.headerCell}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PersonIcon fontSize="inherit" /> Wholesaler
                                    </Box>
                                </TableCell>
                                <TableCell sx={STYLES.headerCell} align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        <InventoryIcon fontSize="inherit" /> Quantity
                                    </Box>
                                </TableCell>
                                <TableCell sx={STYLES.headerCell} align="right">Bid Price (₹)</TableCell>
                                <TableCell sx={STYLES.headerCell} align="center">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bids.map((bid) => (
                                <TableRow 
                                    key={bid.b_id} 
                                    sx={String(bid.bidder_id) === String(currentWholesalerId) ? STYLES.myBidRow : {}}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {bid.wholesaler_name || "Unknown"} 
                                            {String(bid.bidder_id) === String(currentWholesalerId) && " (You)"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={STYLES.qtyCell}>
                                        {bid.quantity ? `${bid.quantity} ${bid.unit}` : "---"}
                                    </TableCell>
                                    <TableCell align="right" sx={STYLES.priceCell}>
                                        ₹{bid.price_per_unit_str}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={bid.status === "A" ? "ACCEPTED" : "PENDING"} 
                                            size="small" 
                                            variant="filled"
                                            sx={{ 
                                                fontWeight: 800, 
                                                fontSize: '0.65rem',
                                                backgroundColor: bid.status === "A" ? "#0288d1" : "#eceff1",
                                                color: bid.status === "A" ? "#fff" : "#455a64"
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}

                            {Array.from({ length: emptyRowsCount }).map((_, index) => (
                                <TableRow key={`empty-${index}`} sx={STYLES.emptyRow}>
                                    <TableCell colSpan={4}>
                                        {bids.length === 0 && index === 0 && (
                                            <Typography align="center" variant="body2" color="textSecondary">
                                                No bids placed yet.
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Snackbar 
                open={!!errorMsg} 
                autoHideDuration={4000} 
                onClose={() => setErrorMsg(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BiddingPortal;