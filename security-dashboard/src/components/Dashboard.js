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
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navbar from './Navbar';
import Modal from './Modal'; // Modal updated with "View Graph" button
import './Dashboard.css'; // Custom styling for the dashboard

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc'); // Sorting order
  const [orderBy, setOrderBy] = useState('id'); // Field to sort by
  const username = localStorage.getItem('username');
  const navigate = useNavigate();  // Initialize useNavigate hook


  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alert'); // Replace with your backend endpoint
      const data = await response.json();
      setAlerts(data.alerts || []);
      setFilteredAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Search functionality
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = alerts.filter((alert) =>
      Object.values(alert).some((val) =>
        String(val).toLowerCase().includes(value)
      )
    );
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
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return a[orderBy] > b[orderBy] ? -1 : 1;
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
        return { backgroundColor: '#f8d7da' }; // Light Red for High severity
      case 'medium':
        return { backgroundColor: '#fff3cd' }; // Light Yellow for Medium severity
      case 'low':
        return { backgroundColor: '#d4edda' }; // Light Green for Low severity
      default:
        return {};
    }
  };

  return (
    <div className="dashboard">
    
    <Navbar setAuth={setAuth} />

      
      {/* Search Field */}
      <div className="table-controls">
        <TextField
          label="Search Alerts"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginBottom: '20px', width: '300px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={exportToExcel}
          style={{ marginLeft: '20px' }}
        >
          Export to Excel
        </Button>
      </div>

      {/* Alerts Table */}
      <TableContainer component={Paper} style={{ maxHeight: '400px', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow >
              {/* Table Headers with Sorting */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleRequestSort('description')}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'severity'}
                  direction={orderBy === 'severity' ? order : 'asc'}
                  onClick={() => handleRequestSort('severity')}
                >
                  Severity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'machine'}
                  direction={orderBy === 'machine' ? order : 'asc'}
                  onClick={() => handleRequestSort('machine')}
                >
                  Machine
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAlerts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((alert) => (
              <TableRow key={alert.id} style={getRowStyle(alert.severity)}>
                <TableCell>{alert.id}</TableCell>
                <TableCell>{alert.name}</TableCell>
                <TableCell>{alert.description}</TableCell>
                <TableCell>{alert.severity}</TableCell>
                <TableCell>{alert.machine}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => openModal(alert)}>
                    More Info
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={sortedAlerts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Modal */}
      {isModalOpen && (
        <Modal show={isModalOpen} onClose={closeModal} alert={selectedAlert} />
      )}
    </div>
  );
};

export default Dashboard;
