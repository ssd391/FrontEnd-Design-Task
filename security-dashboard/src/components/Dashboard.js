import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Modal from './Modal'; // Modal updated with "View Graph" button
import { styled, useTheme } from '@mui/material/styles';

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

const [alerts,setAlerts]=useState([]);
const [filteredAlerts,setFilteredAlerts]=useState([]);
const [selectedAlert,setSelectedAlert]=useState(null);
const [isModalOpen,setIsModalOpen]=useState(false);
const [searchTerm,setSearchTerm]=useState('');
const [page,setPage]=useState(0);
const [rowsPerPage,setRowsPerPage]=useState(5);
const [order,setOrder]=useState('asc'); // Sorting order
const [orderBy,setOrderBy]=useState('id'); // Field to sort by
const [open,setOpen]=React.useState(false);
const [anchorElUser, setAnchorElUser] = React.useState(null); // State for user menu
const username = localStorage.getItem('username');
  
const navigate=useNavigate(); // Initialize useNavigate hook
const theme=useTheme();

useEffect(()=>{
fetchAlerts();
},[]);

const fetchAlerts=async ()=>{
try{
const response=await fetch('http://127.0.0.1:5000/api/alert'); // Replace with your backend endpoint
const data=await response.json();
setAlerts(data.alerts||[]);
setFilteredAlerts(data.alerts||[]);
}catch(error){
console.error('Error fetching alerts:',error);
}
};

// Search functionality
const handleSearch=(e)=>{
const value=e.target.value.toLowerCase();
setSearchTerm(value);
const filteredData=alerts.filter((alert)=>
Object.values(alert).some((val)=>
String(val).toLowerCase().includes(value)
)
);
setFilteredAlerts(filteredData);
};

// Sorting functionality
const handleRequestSort=(property)=>{
const isAsc=orderBy===property&&order==='asc';
setOrder(isAsc?'desc':'asc');
setOrderBy(property);
};

const sortData=(data,order,orderBy)=>{
return data.sort((a,b)=>{
if(order==='asc'){
return a[orderBy]<b[orderBy]?-1:a[orderBy]>b[orderBy]?1 :0 ;
}else{
return a[orderBy]>b[orderBy]?-1:a[orderBy]<b[orderBy]?1 :0 ;
}
});
};

const sortedAlerts=sortData([...filteredAlerts],order,orderBy); // Spread operator to avoid mutating the state directly

const handleChangePage=(event,newPage)=>{
setPage(newPage);
};

const handleChangeRowsPerPage=(event)=>{
setRowsPerPage(parseInt(event.target.value,10));
setPage(0);
};

const openModal=(alert)=>{
setSelectedAlert(alert);
setIsModalOpen(true);
};

const closeModal=()=>{
setIsModalOpen(false);
setSelectedAlert(null);
};

const exportToExcel=()=>{
const worksheet=XLSX.utils.json_to_sheet(alerts);
const workbook=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook,worksheet,'Alerts');
const excelBuffer=XLSX.write(workbook,{ bookType:'xlsx', type:'array'});
const blob=new Blob([excelBuffer],{ type:'application/octet-stream'});
saveAs(blob,'alerts_data.xlsx');
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
const handleDrawerOpen=()=>{
setOpen(true);
};

const handleDrawerClose=()=>{
setOpen(false);
};

// Calculate stats for alerts by severity
const calculateStats=()=>{
return alerts.reduce(
(acc,alert)=>{
acc[alert.severity.toLowerCase()]+=1 ;
return acc;
},
{ high :0 ,medium :0 ,low :0 }
);
};

const stats=calculateStats();

// User menu handlers
const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
};

const handleCloseUserMenu = () => {
    setAnchorElUser(null);
};

// Create a dark theme using Material UI's createTheme function.
 const darkTheme = createTheme({
   palette: {
     mode: 'dark',
     background: {
       default: '#121212',
       paper: '#1e1e1e'
     },
     text: {
       primary: '#ffffff'
     },
     action:{
       active:'#ffffff',
       hover:'#424242'
     }
   }
 });

 return (
   <ThemeProvider theme={darkTheme}>
     <CssBaseline />
     <Box sx={{ display :'flex'}}>
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ mr: 2, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleOpenUserMenu} color="inherit">
                <Avatar
                  alt={username}
                  src="/path-to-user-image.jpg"
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                {username}
              </Typography>
            </Box>
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
            <MenuItem onClick={handleCloseUserMenu}>
              <Typography textAlign="center">My Profile</Typography>
            </MenuItem>
            <MenuItem onClick={() => { setAuth(false); navigate('/login'); }}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
       <Drawer sx={{ width :drawerWidth , flexShrink :0 , '& .MuiDrawer-paper':{ width :drawerWidth , boxSizing :'border-box'}}} variant="persistent" anchor="left" open={open}>
         <DrawerHeader>
           <IconButton onClick={handleDrawerClose}>
             {theme.direction==='ltr'?<ChevronLeftIcon/>:<ChevronRightIcon/>}
           </IconButton>
         </DrawerHeader>
         <Divider/>
         <List>
           {['Inbox','Starred','Send email','Drafts'].map((text,index)=>(
             <ListItem key={text} disablePadding>
               <ListItemButton>
                 <ListItemIcon>{index%2===0?<InboxIcon/>:<MailIcon/>}</ListItemIcon>
                 <ListItemText primary={text}/>
               </ListItemButton>
             </ListItem>
           ))}
         </List>
         <Divider/>
         <List>
           {['All mail','Trash','Spam'].map((text,index)=>(
             <ListItem key={text} disablePadding>
               <ListItemButton>
                 <ListItemIcon>{index%2===0?<InboxIcon/>:<MailIcon/>}</ListItemIcon>
                 <ListItemText primary={text}/>
               </ListItemButton>
             </ListItem>
           ))}
         </List>
       </Drawer>

       {/* Main Content */}
       <Main open={open}>
         {/* Offset for AppBar */}
         <DrawerHeader/>

         {/* Stats Section */}
         <Box className="stats" sx={{ display:'flex', justifyContent:'center', gap:'20px', mb:'20px'}}>
           {['high','medium','low'].map((severity)=>(
             <Card key={severity} className={`card-${severity}`} sx={{ minWidth :200, bgcolor:getRowStyle(severity).backgroundColor}}>
               <CardContent>
                 <Typography variant="h6">{severity.charAt(0).toUpperCase()+severity.slice(1)} Severity Alerts</Typography>
                 <Typography variant="h4">{stats[severity]}</Typography>
               </CardContent>
             </Card>
           ))}
         </Box>

         {/* Alerts Table */}
         <TableContainer component={Paper} style={{ height :'100%', overflow :'auto'}}>
           <Table stickyHeader aria-label="alerts table">
             <TableHead>
               <TableRow >
                 {/* Table Headers with Sorting */}
                 {['id','name','description','severity','machine'].map((column)=>(
                   <TableCell key={column}>
                     <TableSortLabel active={orderBy===column} direction={orderBy===column? order:'asc'} onClick={()=>handleRequestSort(column)}>
                       {column.charAt(0).toUpperCase()+column.slice(1)}
                     </TableSortLabel>
                   </TableCell>
                 ))}
                 <TableCell>Actions</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {sortedAlerts.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage).map((alert)=>(
                 <TableRow key={alert.id} style={getRowStyle(alert.severity)}>
                   {['id','name','description','severity','machine'].map((field)=>(
                     <TableCell key={field}>{alert[field]}</TableCell>
                   ))}
                   {/* Blue Button */}
                   <TableCell><Button variant="contained" sx={{ bgcolor:'#2196f3', '&:hover':{ bgcolor:'#1976d2'}}} onClick={()=>openModal(alert)}>More Info</Button></TableCell> 
                 </TableRow>

               ))}
             </TableBody>

           {/* Pagination */}
           </Table>

           {/* Pagination */}
           <TablePagination component="div" count={sortedAlerts.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage}/>
         </TableContainer>

         {/* Modal */}
         {isModalOpen&&(<Modal show={isModalOpen} onClose={closeModal} alert={selectedAlert}/>)}
       </Main>

     </Box> 
   </ThemeProvider> 
 );
};

export default Dashboard;