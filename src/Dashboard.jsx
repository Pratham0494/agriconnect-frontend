import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token"); 
        localStorage.removeItem("refresh_token");
        navigate("/login"); 
    };

    const getActiveStyle = ({ isActive }) => ({
        ...styles.linkStyle,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        color: isActive ? '#ffffff' : '#c8e6c9',
        borderLeft: isActive ? '4px solid #4caf50' : '4px solid transparent',
        fontWeight: isActive ? '700' : '500',
    });

    const isOverviewPage = location.pathname === '/admin-dashboard' || location.pathname === '/admin-dashboard/';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f8faf9' }}>
            {/* Sidebar */}
            <aside style={{
                ...styles.sidebarStyle,
                width: isExpanded ? '240px' : '70px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                <div style={styles.sidebarHeaderStyle}>
                    {isExpanded && <h2 style={styles.logoStyle}>AGRICONNECT</h2>}
                    <button onClick={toggleSidebar} style={styles.hamburgerButtonStyle}>
                        {isExpanded ? '←' : '☰'}
                    </button>
                </div>

                <nav style={{ ...styles.navStyle, alignItems: isExpanded ? 'stretch' : 'center', flex: 1 }}>
                    <NavLink to="/admin-dashboard" end style={getActiveStyle}>
                        {isExpanded ? "OVERVIEW" : "HOME"}
                    </NavLink>
                    
                    {isExpanded && <div style={styles.sectionLabelStyle}>REGISTRATION DATA</div>}
                    
                    <NavLink to="/admin-dashboard/farmers" style={getActiveStyle}>
                        {isExpanded ? "FARMERS" : "FMR"}
                    </NavLink>

                    <NavLink to="/admin-dashboard/crops" style={getActiveStyle}>
                        {isExpanded ? "CROPS" : "CRP"}
                    </NavLink>

                    <NavLink to="/admin-dashboard/farmer-stock" style={getActiveStyle}>
                        {isExpanded ? "FARMER STOCK" : "FST"}
                    </NavLink>
                    
                    <NavLink to="/admin-dashboard/stock" style={getActiveStyle}>
                        {isExpanded ? "STOCK REGISTRATION" : "STK"}
                    </NavLink>
                    
                    {isExpanded && <div style={styles.sectionLabelStyle}>PARTNERS</div>}

                    <NavLink to="/admin-dashboard/wholesalers" style={getActiveStyle}>
                        {isExpanded ? "WHOLESALERS" : "WHL"}
                    </NavLink>

                    <NavLink to="/admin-dashboard/wholesaler-stock" style={getActiveStyle}>
                        {isExpanded ? "WHOLESALER STOCK" : "WST"}
                    </NavLink>

                    
                    <NavLink to="/admin-dashboard/wholesaler-stock-detail" style={getActiveStyle}>
                        {isExpanded ? "WHOLESALER STOCK DETAIL" : "WSD"}
                    </NavLink>
                </nav>

                <div style={{ ...styles.logoutContainer, alignItems: isExpanded ? 'stretch' : 'center' }}>
                    <button onClick={handleLogout} style={styles.logoutButtonStyle}>
                        {isExpanded ? "LOGOUT" : "EXIT"}
                    </button>
                </div>
            </aside>

            
            <main style={{
                ...styles.mainContentStyle,
                marginLeft: isExpanded ? '240px' : '70px',
                width: `calc(100% - ${isExpanded ? '240px' : '70px'})`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={styles.contentWrapperStyle}>
                    {isOverviewPage && (
                        <div style={styles.statsGridStyle}>
                            <div style={styles.emptyCardStyle}>
                                <small style={styles.cardLabelStyle}>TOTAL REVENUE</small>
                            </div>
                            <div style={styles.emptyCardStyle}>
                                <small style={styles.cardLabelStyle}>ACTIVE FARMERS</small>
                            </div>
                            <div style={styles.emptyCardStyle}>
                                <small style={styles.cardLabelStyle}>PENDING LISTINGS</small>
                            </div>
                        </div>
                    )}
                    
                    <div style={isOverviewPage ? {} : styles.pageCardStyle}>
                        <Outlet /> 
                    </div>
                </div>
            </main>
        </div>
    );
};


const styles = {
    sidebarStyle: {
        backgroundColor: '#0a2e0c',
        color: 'white',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        fontFamily: '"Inter", sans-serif',
        zIndex: 1000,
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    sidebarHeaderStyle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        marginBottom: '30px',
        height: '40px'
    },
    navStyle: {
        display: 'flex',
        flexDirection: 'column',
    },
    linkStyle: {
        textDecoration: 'none',
        fontSize: '11px', 
        letterSpacing: '1.5px',
        padding: '14px 20px',
        transition: 'all 0.2s ease',
        display: 'block',
        whiteSpace: 'nowrap',
    },
    logoStyle: {
        color: '#ffffff',
        fontSize: '14px', 
        fontWeight: '900',
        letterSpacing: '3px',
        margin: 0
    },
    hamburgerButtonStyle: {
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionLabelStyle: {
        fontSize: '9px',
        fontWeight: '900',
        color: '#4caf50',
        marginTop: '25px',
        marginBottom: '10px',
        paddingLeft: '20px',
        letterSpacing: '2px',
        opacity: 0.7
    },
    logoutContainer: {
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: 'auto'
    },
    logoutButtonStyle: {
        width: '100%',
        backgroundColor: '#d32f2f',
        color: '#ffffff',
        border: 'none',
        padding: '12px',
        fontSize: '10px',
        fontWeight: '900',
        letterSpacing: '1.5px',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background 0.2s ease',
        whiteSpace: 'nowrap'
    },
    mainContentStyle: {
        flex: 1,
        padding: '30px',
        boxSizing: 'border-box',
    },
    contentWrapperStyle: {
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
    },
    pageCardStyle: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        borderTop: '4px solid #1b5e20',
        minHeight: '600px'
    },
    statsGridStyle: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
    },
    emptyCardStyle: {
        padding: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #eee',
        borderRadius: '4px',
        height: '100px',
        display: 'flex',
        alignItems: 'flex-start'
    },
    cardLabelStyle: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#999',
        letterSpacing: '1px'
    }
};

export default DashboardLayout;
