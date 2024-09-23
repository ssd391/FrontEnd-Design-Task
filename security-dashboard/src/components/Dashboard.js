import React, { useState, useEffect } from 'react';
import { useNavigate, Link, navigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Button,
  TableSortLabel,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, styled, useTheme } from '@mui/material/styles'; // Import styled and useTheme
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Grid } from '@mui/material';
import Modal from './Modal.js'
import AddIcon from '@mui/icons-material/Add'; // Import Add Icon
import InfoIcon from '@mui/icons-material/Info'; // Import Info Icon
import moment from 'moment';
import { ResponsiveContainer } from 'recharts';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  ComposedChart
 } from 'recharts';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    }),
    height: '100vh', // Full screen height
    overflow: 'auto' // Enable scrolling
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end'
}));

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [open, setOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const username = localStorage.getItem('username');

  const navigate = useNavigate();
  const theme = useTheme();

  const [severityStats, setSeverityStats] = useState({ high: 0, medium: 0, low: 0 });

  useEffect(() => {
    const stats = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity.toLowerCase()] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
    setSeverityStats(stats);
  }, [alerts]);

  const totalAlerts = severityStats.high + severityStats.medium + severityStats.low;

  // Function to calculate the percentage
  const getPercentage = (count) => (totalAlerts > 0 ? ((count / totalAlerts) * 100).toFixed(1) : 0);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alert');
      const data = await response.json();
      setAlerts(data.alerts || []);
      setFilteredAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleCloseUserMenu();
  };

  // Calculate stats for alerts by severity
  const calculateStats = () => {
    return alerts.reduce(
      (acc, alert) => {
        acc[alert.severity.toLowerCase()] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
  };

  const calculateMachineStats = () => {
    return alerts.reduce((acc, alert) => {
      acc[alert.machine] = acc[alert.machine] ? acc[alert.machine] + 1 : 1;
      return acc;
    }, {});
  };

  const calculateProgramStats = () => {
    return alerts.reduce((acc, alert) => {
      acc[alert.program] = acc[alert.program] ? acc[alert.program] + 1 : 1;
      return acc;
    }, {});
  };

  const stats = calculateStats();
  const machineStats = calculateMachineStats();
  const programStats = calculateProgramStats();

  // Prepare data for pie chart (severity distribution)
  const pieData = [
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low }
  ];

  const COLORS = ['#EE4266', '#FFD23F', '#337357'];

  // Prepare data for bar chart (alerts per machine)
  const barData = Object.keys(machineStats).map((machine) => ({
    machine,
    alerts: machineStats[machine]
  }));

  // Prepare data for stacked bar chart (severity by machine)
  const stackedBarData = Object.keys(machineStats).map((machine) => {
    const machineAlerts = alerts.filter((alert) => alert.machine === machine);
    return {
      machine,
      high: machineAlerts.filter((alert) => alert.severity.toLowerCase() === 'high').length,
      medium: machineAlerts.filter((alert) => alert.severity.toLowerCase() === 'medium').length,
      low: machineAlerts.filter((alert) => alert.severity.toLowerCase() === 'low').length,
    };
  });

  // Prepare data for line chart (alerts over time)
  const lineChartData = alerts
    .filter(alert => alert.occurred_on !== 'Varied') // Exclude "Varied" dates
    .map(alert => ({
      date: alert.occurred_on, // Extract just the date part
      severity: alert.severity
    }))
    .reduce((acc, alert) => {
      const dateEntry = acc.find(entry => entry.date === alert.date);
      if (dateEntry) {
        dateEntry[alert.severity.toLowerCase()] += 1;
      } else {
        acc.push({ date: alert.date, high: 0, medium: 0, low: 0 });
        acc[acc.length - 1][alert.severity.toLowerCase()] += 1;
      }
      return acc;
    }, []);

  // Search functionality
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterAlerts(selectedSeverity, selectedMachine, value); // Apply filtering based on severity, machine, and search term
  };

  const filterAlerts = (severity, machine, searchTerm) => {
    let filteredData = alerts;

    if (severity) {
      filteredData = filteredData.filter((alert) => alert.severity.toLowerCase() === severity);
    }

    if (machine) {
      filteredData = filteredData.filter((alert) => alert.machine === machine);
    }

    if (searchTerm) {
      filteredData = filteredData.filter((alert) =>
        Object.values(alert).some((val) => String(val).toLowerCase().includes(searchTerm))
      );
    }

    setFilteredAlerts(filteredData);
  };

  // Sorting functionality
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data, order, orderBy) => {
    return data.sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0;
      } else {
        return a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0;
      }
    });
  };

  const sortedAlerts = sortData([...filteredAlerts], order, orderBy); // Spread operator to avoid mutating the state directly

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openModal = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(alerts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alerts');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'alerts_data.xlsx');
  };

  const getRowStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return { backgroundColor: '#EE4266', color: '#ffffff' }; // Red for High severity
      case 'medium':
        return { backgroundColor: '#FFD23F', color: '#000000' }; // Yellow for Medium severity
      case 'low':
        return { backgroundColor: '#337357', color: '#ffffff' }; // Green for Low severity
      default:
        return {};
    }
  };

  // Drawer handlers
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // User menu handlers
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle click on a pie chart segment
  const handlePieClick = (data) => {
    const severity = data.name.toLowerCase(); // Get the clicked severity
    setSelectedSeverity(severity);
    filterAlerts(severity, selectedMachine, searchTerm); // Filter alerts based on severity
  };

    // Function to get the color based on severity
    const getSeverityColor = (severity) => {
      switch (severity.toLowerCase()) {
        case 'high':
          return '#EE4266'; // Red for High severity
        case 'medium':
          return '#FFD23F'; // Yellow for Medium severity
        case 'low':
          return '#337357'; // Green for Low severity
        default:
          return '#000'; // Default black
      }
    };

    const prepareTimeSeriesData = () => {
      const dateCount = alerts.reduce((acc, alert) => {
        if (alert.occured_on && alert.occured_on !== 'Varied') {
          const date = moment(alert.occured_on, "YYYY-MM-DD HH:mm:ss.SSSSSS");
          if (date.isValid()) {
            const dateString = date.format("YYYY-MM-DD");
            acc[dateString] = (acc[dateString] || 0) + 1;
          }
        }
        return acc;
      }, {});
       return Object.entries(dateCount)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => moment(a.date).diff(moment(b.date)));
    };
   
   
    const timeSeriesData = prepareTimeSeriesData();
    console.log(timeSeriesData);
    
    // Calculate important stats
    const totalAlertsDay = timeSeriesData.reduce((sum, day) => sum + day.count, 0);
    const dateRange = timeSeriesData.length > 0
      ? `${timeSeriesData[0].date} to ${timeSeriesData[timeSeriesData.length - 1].date}`
      : 'No data';
    const peakDay = timeSeriesData.reduce((max, day) =>
      day.count > max.count ? day : max
    , { date: '', count: 0 });
  
    // Get the two most recent alerts based on occurred_on
    const getRecentAlerts = () => {
      return alerts
        .filter((alert) => alert.occurred_on !== 'Varied')
        .sort((a, b) => new Date(b.occurred_on) - new Date(a.occurred_on))
        .slice(0, 2);
    };
  
    const recentAlerts = getRecentAlerts();

  // Handle click on a bar chart segment
  const handleBarClick = (data) => {
    const machine = data.machine; // Get the clicked machine
    setSelectedMachine(machine);
    filterAlerts(selectedSeverity, machine, searchTerm); // Filter alerts based on machine
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#ffffff',
        paper: '#f1f7f7'
      },
      text: {
        primary: '#000000'
      },
      action: {
        active: '#ffffff',
        hover: '#424242'
      }
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', backgroundColor : '#ffffff' }}>

      <AppBar position="fixed" open={open}>
           <Toolbar>
             <IconButton
               color="inherit"
               aria-label="open drawer"
               onClick={handleDrawerOpen}
               edge="start"
               sx={{ mr: 2, ...(open && { display: 'none' }) }}
             >
               <MenuIcon />
             </IconButton>
             <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
               Threat Detection Dashboard
             </Typography>
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <Typography variant="subtitle1" sx={{ mr: 1 }}>
                 {username}
               </Typography>
               <IconButton onClick={handleOpenUserMenu} color="inherit">
                 <Avatar alt={username} src="/path-to-user-image.jpg" sx={{ width: 40, height: 40 }} />
               </IconButton>
             </Box>
           </Toolbar>
       </AppBar>
       <Menu
         sx={{ mt: '45px' }}
         id="menu-appbar"
         anchorEl={anchorElUser}
         anchorOrigin={{
           vertical: 'top',
           horizontal: 'right',
         }}
         keepMounted
         transformOrigin={{
           vertical: 'top',
           horizontal: 'right',
         }}
         open={Boolean(anchorElUser)}
         onClose={handleCloseUserMenu}
       >
         <MenuItem onClick={handleProfileClick}>
           <Typography textAlign="center">My Profile</Typography>
         </MenuItem>
         <MenuItem onClick={() => { setAuth(false); navigate('/login'); }}>
           <Typography textAlign="center">Logout</Typography>
         </MenuItem>
       </Menu>
       <Drawer
             sx={{
               width: drawerWidth,
               flexShrink: 0,
               '& .MuiDrawer-paper': {
                 width: drawerWidth,
                 boxSizing: 'border-box'
               }
             }}
             variant="persistent"
             anchor="left"
             open={open}
           >
             <DrawerHeader>
               <IconButton sx={{ color: 'grey' }} onClick={handleDrawerClose}>
                 {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
               </IconButton>
             </DrawerHeader>
             <Divider />
             <List>
               <ListItem key="Upload" disablePadding>
                 <ListItemButton component={Link} to="/upload">
                   <ListItemIcon sx={{ color: 'grey' }}><DriveFolderUploadIcon /></ListItemIcon>
                   <ListItemText primary="Upload" />
                 </ListItemButton>
               </ListItem>
             </List>
             <Divider />
             <List>
             <ListItem key="Processing" disablePadding>
                 <ListItemButton component={Link} to="/processing">
                   <ListItemIcon sx={{ color: 'grey' }}><AutorenewIcon/></ListItemIcon>
                   <ListItemText primary="Processing" />
                 </ListItemButton>
               </ListItem>
             </List>
           </Drawer>

        {/* Main Content */}
        <Main open={open}>
          <DrawerHeader />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', mb: '20px', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: '20px' }}>
          <Typography variant='h2' component="div">
            Threat Detection
          </Typography>
          <Typography variant='h2' component="div">
            Dashboard
          </Typography>
        </Box>
          {/* Stats Section */}
          <Box
            className="stats"
            sx={{
              display: 'flex',
              gap: '20px',
              mb: '20px',
              ml: 'auto', // Move to the right side
              width: '33%', // Occupy 33% of the available width
            }}
          >
            {/* {['high', 'medium', 'low'].map((severity) => (
              <Card
                key={severity}
                className={`card-${severity}`}
                sx={{
                  width: '100%',
                  height: '150px', // Adjust height to make it more square-shaped
                  bgcolor: getRowStyle(severity).backgroundColor,
                  borderRadius: '15px', // Add border radius
                  boxShadow: 'none', // Remove the box shadow
                }}
              >
                <CardContent>
                  <Typography variant="h6">{severity.charAt(0).toUpperCase() + severity.slice(1)} Severity Alerts</Typography>
                  <Typography variant="h4">{stats[severity]}</Typography>
                </CardContent>
              </Card>
            ))} */}
            <Card sx={{ minWidth: 350, padding: '20px', mb: '20px', backgroundColor: '#ffffff', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recent Alerts</Typography>
                {/* Replace 'View all' button with '+' icon button */}
                <IconButton
                  onClick={() => navigate('/alerts')}
                  size="small"
                  sx={{ backgroundColor: 'black', color: 'white', borderRadius: '50%', p: 0.5, '&:hover': { backgroundColor: '#333' },  // Darker hover state
                  '&:active': { backgroundColor: '#111' }, '&:hover': { backgroundColor: '#333' } }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box>
                {recentAlerts.map((alert) => (
                  <Box key={alert.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: getSeverityColor(alert.severity),
                        mr: 1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">{alert.name}</Typography>
                      <Typography variant="body2">
                        {alert.program} : {alert.machine}
                      </Typography>
                    </Box>
                    {/* Replace 'More info' button with smaller info icon button */}
                    <IconButton
                      size="small"
                      sx={{ backgroundColor: 'black', color: 'white', borderRadius: '50%', p: 0.5, '&:active': { backgroundColor: '#111' }, '&:hover': { backgroundColor: '#333' } }}
                      onClick={() => openModal(alert)}
                    >
                      <InfoIcon fontSize="small" /> {/* Set the icon size to small */}
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
          </Box>

          {/* Graphs Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', mb: '20px', flexWrap: 'wrap' }}>
         <Card sx={{ width: '48%', minWidth: '300px', p: 0, borderRadius: '15px', backgroundColor: '#f1f7f7', overflow: 'hidden' }}>
 <Box sx={{
   backgroundColor: '#CAE2E2',
   borderRadius: '15px',
   overflow: 'hidden',
   height: '70%',
   p: 2,
   display: 'flex',
   justifyContent: 'center',
   alignItems: 'center'
 }}>
   <ResponsiveContainer width="100%" height="100%">
  <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
       <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,125,50,0.3)" />
       <XAxis
         dataKey="date"
         tickFormatter={(tick) => moment(tick).format('MM/DD')}
         stroke="#2e7d32"
       />
       <YAxis yAxisId="left" stroke="#2e7d32" />
       <YAxis yAxisId="right" orientation="right" stroke="#2e7d32" />
       <Tooltip
         labelFormatter={(label) => moment(label).format('YYYY-MM-DD')}
         contentStyle={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
       />
       <Legend wrapperStyle={{ color: '#2e7d32' }} />
       <Bar yAxisId="left" dataKey="count" fill="#ffffff" name="Alert Count" barSize={30} />
       <Line
         yAxisId="right"
         type="monotone"
         dataKey="count"
         stroke="#1b5e20"
         name="Trend"
         strokeWidth={3}
       />
     </ComposedChart>
   </ResponsiveContainer>
 </Box>
 <Box sx={{ p: 2, height: '30%' }}>
   <Divider sx={{ mb: 2 }} />
   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
     <Box sx={{ width: '32%', textAlign: 'center' }}>
       <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem', color: '#333333', fontWeight: 'medium' }}>Total Alerts</Typography>
       <Typography variant="h6" color="text.primary">{totalAlertsDay}</Typography>
     </Box>
     <Box sx={{ width: '32%', textAlign: 'center' }}>
       <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem', color: '#333333', fontWeight: 'medium' }}>Date Range</Typography>
       <Typography variant="h6" color="text.primary">{dateRange}</Typography>
     </Box>
     <Box sx={{ width: '32%', textAlign: 'center' }}>
       <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem', color: '#333333', fontWeight: 'medium' }}>Peak Day</Typography>
       <Typography variant="h6" color="text.primary">{peakDay.date}</Typography>
       <Typography variant="subtitle2" color="text.secondary">({peakDay.total} alerts)</Typography>
     </Box>
   </Box>
    {/* <Typography variant="h6" align="center" sx={{ pt: 2, pb: 1 }}>Alerts Over Time</Typography> */}
 </Box>
</Card>


 <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '48%' }}>
   <Card sx={{ p: 2, backgroundColor: '#f1f7f7', borderRadius: '15px' }}>
     <Typography variant="h6" align="center" sx={{ mb: 2 }}>Severity Stats</Typography>
     <Box sx={{ display: 'flex', mb: 2 }}>
       <Box sx={{ flex: severityStats.high, backgroundColor: '#FF8080', height: '8px', borderRadius: '4px' }} />
       <Box sx={{ flex: severityStats.medium, backgroundColor: '#FFFF9D', height: '8px', borderRadius: '4px' }} />
       <Box sx={{ flex: severityStats.low, backgroundColor: '#C0EDA6', height: '8px', borderRadius: '4px' }} />
     </Box>
     <Grid container spacing={2}>
       <Grid item xs={6}><Typography>High Severity</Typography></Grid>
       <Grid item xs={3}><Typography>{severityStats.high}</Typography></Grid>
       <Grid item xs={3}><Typography>{((severityStats.high / alerts.length) * 100).toFixed(1)}%</Typography></Grid>
       <Grid item xs={6}><Typography>Medium Severity</Typography></Grid>
       <Grid item xs={3}><Typography>{severityStats.medium}</Typography></Grid>
       <Grid item xs={3}><Typography>{((severityStats.medium / alerts.length) * 100).toFixed(1)}%</Typography></Grid>
       <Grid item xs={6}><Typography>Low Severity</Typography></Grid>
       <Grid item xs={3}><Typography>{severityStats.low}</Typography></Grid>
       <Grid item xs={3}><Typography>{((severityStats.low / alerts.length) * 100).toFixed(1)}%</Typography></Grid>
     </Grid>
   </Card>


   <Card sx={{ p: 2, backgroundColor: '#f1f7f7', borderRadius: '15px' }}>
     <Typography variant="h6" align="center" sx={{ mb: 2 }}>Severity by Machine</Typography>
     <Box sx={{ display: 'flex', justifyContent: 'center' }}>
       <BarChart width={500} height={300} data={stackedBarData}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis dataKey="machine" />
         <YAxis />
         <Tooltip />
         <Legend />
         <Bar dataKey="high" stackId="a" fill="#FF8080" />
         <Bar dataKey="medium" stackId="a" fill="#FFFF9D" />
         <Bar dataKey="low" stackId="a" fill="#C0EDA6" />
       </BarChart>
     </Box>
   </Card>
 </Box>
</Box>

          {/* Search and Actions Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* Search Field */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ mr: 1 }} />
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              />
            </Box>
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={fetchAlerts}
                size="large"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  p: 2,
                  borderRadius: '4px', // Make the button rectangular with slightly rounded corners
                  width: 'auto', // Set auto width
                  height: 'auto', // Set auto height
                  '&:hover': { backgroundColor: '#333' },  // Darker hover state
                  '&:active': { backgroundColor: '#111' } , // Even darker active state
                  marginRight: 1
                }}
              >
                <FileDownloadOutlinedIcon />
              </IconButton>
              <IconButton
                onClick={fetchAlerts}
                size="large"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  p: 2,
                  borderRadius: '4px', // Make the button rectangular with slightly rounded corners
                  width: 'auto', // Set auto width
                  height: 'auto', // Set auto height
                  '&:hover': { backgroundColor: '#333' },  // Darker hover state
                  '&:active': { backgroundColor: '#111' }  // Even darker active state
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Alerts Table */}
          <TableContainer component={Paper} style={{ height: '100%', overflow: 'auto', boxShadow: 'none', borderRadius: '8px' }}>
  <Table
    stickyHeader
    aria-label="alerts table"
    sx={{
      fontFamily: 'Nunito, sans-serif', // Apply Nunito font
      fontSize: '16px', // Increase font size
      borderCollapse: 'separate',
      borderSpacing: 0,
      '& .MuiTableCell-root': {
        borderBottom: 'none', // Remove partition lines between rows
      },
    }}
  >
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: '#f5f5f5', // Light grey background for headers
        }}
      >
        {['id', 'name', 'description', 'severity', 'machine'].map((column) => (
          <TableCell
            key={column}
            sx={{
              fontWeight: 'bold', // Make headers bold
              textAlign: 'left', // Align text to the left
              fontSize: '18px', // Increase font size for headers
              color: '#333', // Dark grey color for text
              borderBottom: '2px solid #ddd', // Light border for header
            }}
          >
            <TableSortLabel
              active={orderBy === column}
              direction={orderBy === column ? order : 'asc'}
              onClick={() => handleRequestSort(column)}
              sx={{ color: '#333', '&:hover': { color: '#555' } }} // Dark grey on hover
            >
              {column.charAt(0).toUpperCase() + column.slice(1)}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: '18px', color: '#333', borderBottom: '2px solid #ddd' }}>
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {sortedAlerts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((alert) => (
        <TableRow
          key={alert.id}
          sx={{
            '&:hover': {
              backgroundColor: '#f9f9f9', // Lighter grey background on hover
            },
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          {['id', 'name', 'description', 'severity', 'machine'].map((field) => (
            <TableCell
              key={field}
              sx={{
                padding: '12px 16px', // Add padding for better readability
                fontSize: '16px', // Increase font size for content
                color: '#555', // Dark grey for content
              }}
            >
              {/* Check if it's the severity column to render the colored square */}
              {field === 'severity' ? (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: getSeverityColor(alert.severity), // Function to get color based on severity
                    borderRadius: '4px', // Make it square
                    display: 'inline-block',
                    mr: 1, // Add margin to the right of the square
                  }}
                />
              ) : (
                alert[field]
              )}
            </TableCell>
          ))}
          <TableCell>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'black',
                color: 'white',
                borderRadius: '4px',
                p: 0.5,
                '&:hover': { backgroundColor: '#333' },
                '&:active': { backgroundColor: '#111' },
              }}
              onClick={() => openModal(alert)}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>

  {/* Styled Pagination */}
  <TablePagination
    component="div"
    count={sortedAlerts.length}
    page={page}
    onPageChange={handleChangePage}
    rowsPerPage={rowsPerPage}
    onRowsPerPageChange={handleChangeRowsPerPage}
    sx={{
      fontFamily: 'Nunito, sans-serif', // Apply same font to pagination
      fontSize: '16px',
      color: '#333',
      backgroundColor: '#f5f5f5',
      '& .MuiTablePagination-selectLabel': {
        fontWeight: 'bold', // Make pagination text bold
      },
      '& .MuiTablePagination-input': {
        fontWeight: 'bold', // Make rows per page text bold
      },
      '& .MuiTablePagination-actions': {
        color: '#333',
      },
    }}
  />
</TableContainer>



          {/* Modal */}
          {isModalOpen && <Modal show={isModalOpen} onClose={closeModal} alert={selectedAlert} />}
        </Main>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
