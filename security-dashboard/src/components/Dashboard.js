import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Button, TableSortLabel, Grid, Typography, Card,
  CardContent, Tooltip, IconButton
} from '@mui/material'; // Updated Grid and other components from MUI v5
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navbar from './Navbar';
import Modal from './Modal';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alert');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
      setFilteredAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      alert('Failed to fetch alerts. Please check the API.');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = alerts.filter((alert) =>
      Object.values(alert).some((val) => String(val).toLowerCase().includes(value))
    );
    setFilteredAlerts(filteredData);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data, order, orderBy) => {
    return data.sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedAlerts = React.useMemo(
    () => sortData([...filteredAlerts], order, orderBy),
    [filteredAlerts, order, orderBy]
  );

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
        return { backgroundColor: '#f8d7da' };
      case 'medium':
        return { backgroundColor: '#fff3cd' };
      case 'low':
        return { backgroundColor: '#d4edda' };
      default:
        return {};
    }
  };

  const getAlertStats = () => {
    const stats = { high: 0, medium: 0, low: 0 };

    if (alerts && alerts.length) {
      alerts.forEach((alert) => {
        const severity = alert.severity.toLowerCase();
        if (stats[severity] !== undefined) {
          stats[severity]++;
        }
      });
    }

    return [
      { name: 'High', value: 10 },
      { name: 'Medium', value: 5},
      { name: 'Low', value: 6 },
    ];
  };

  return (
    <div className="dashboard">
      <Navbar setAuth={setAuth} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1">Welcome, {username}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent className="card-content">
              <Typography variant="h6">Alert Statistics</Typography>
              {/* <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getAlertStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardContent className="card-content">
              <Typography variant="h6">Quick Actions</Typography>
              <Tooltip title="Export to Excel">
                <IconButton color="primary" onClick={exportToExcel}>
                  <FileDownloadOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchAlerts}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <div className="table-controls">
              <TextField
                label="Search Alerts"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  endAdornment: <SearchIcon />
                }}
              />
            </div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['id', 'name', 'severity', 'machine'].map((column) => (
                      <TableCell key={column}>
                        <TableSortLabel
                          active={orderBy === column}
                          direction={orderBy === column ? order : 'asc'}
                          onClick={() => handleRequestSort(column)}
                        >
                          {column.charAt(0).toUpperCase() + column.slice(1)}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAlerts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((alert) => (
                      <TableRow key={alert.id} style={getRowStyle(alert.severity)} className="table-row">
                        <TableCell>{alert.id}</TableCell>
                        <TableCell>{alert.name}</TableCell>
                        <TableCell>{alert.severity}</TableCell>
                        <TableCell>{alert.machine}</TableCell>
                        <TableCell>
                          <Button variant="outlined" onClick={() => openModal(alert)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAlerts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showFirstButton
              showLastButton
            />
          </Paper>
        </Grid>
      </Grid>
      <Modal show={isModalOpen} onClose={closeModal} alert={selectedAlert} />
    </div>
  );
};

export default Dashboard;
