import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-vis-network-graph';
import { Rnd } from 'react-rnd';
import { Card, CardContent, Typography, Button } from '@mui/material';
import './NetworkPage.css';
import uuid from 'react-uuid';

const NetworkPage = () => {
  const { alertId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedNode, setClickedNode] = useState(null);
  const [showTransparent, setShowTransparent] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null); // State to hold alert details

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    setLoading(true);

    // Fetch both the network data and the alert details
    const fetchData = async () => {
      try {
        // Fetch network data
        const networkResponse = await axios.get(`http://127.0.0.1:5000/api/network/${alertId}`);
        const { nodes, edges } = networkResponse.data;
        const sortedEdges = edges.sort((a, b) => new Date(a.time) - new Date(b.time));

        const nodesByRank = nodes.reduce((acc, node) => {
          const rank = node.rank || 0;
          if (!acc[rank]) acc[rank] = [];
          acc[rank].push(node);
          return acc;
        }, {});

        const nodePositions = {};
        const rankSpacingX = 200;
        const ySpacing = 100;

        Object.keys(nodesByRank).forEach(rank => {
          const nodesInRank = nodesByRank[rank];
          nodesInRank.sort((a, b) => {
            const aEdges = edges.filter(edge => edge.source === a.id || edge.target === a.id);
            const bEdges = edges.filter(edge => edge.source === b.id || edge.target === b.id);
            return aEdges.length - bEdges.length;
          });

          const totalNodesInRank = nodesInRank.length;
          nodesInRank.forEach((node, index) => {
            nodePositions[node.id] = {
              x: rank * rankSpacingX,
              y: index * ySpacing - (totalNodesInRank * ySpacing) / 2,
            };
          });
        });

        const positionedNodes = nodes.map(node => ({
          ...node,
          x: nodePositions[node.id].x,
          y: nodePositions[node.id].y,
        }));

        setNodes(positionedNodes);
        setEdges(sortedEdges);

        // Fetch alert details
        const alertResponse = await axios.get(`http://127.0.0.1:5000/alert/${alertId}`);
        setAlertDetails(alertResponse.data); // Set the alert details to state

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [alertId]);

  const handleNodeClick = (event) => {
    const { nodes: clickedNodes } = event;
    if (clickedNodes.length > 0) {
      const nodeId = clickedNodes[0];
      const clickedNode = nodes.find(node => node.id === nodeId);
      setClickedNode(clickedNode || null);
    }
  };

  const handleClosePopup = () => {
    setClickedNode(null);
  };

  const toggleTransparentEdges = () => {
    setShowTransparent(prevState => !prevState);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const formatFilePath = (filePath) => {
    const parts = filePath.split('\\');
    if (filePath.length > 12 && parts[0] !== 'comb-file') {
      return `${parts[0]}\\...`;
    }
    return filePath;
  };

  const filteredNodes = showTransparent ? nodes : nodes.filter(node =>
    edges.some(edge => (edge.source === node.id || edge.target === node.id) && !edge.transparent)
  );
  const filteredEdges = showTransparent ? edges : edges.filter(edge => !edge.transparent);

  const options = {
    layout: { hierarchical: false },
    edges: {
      color: { color: '#000000', highlight: '#ff0000', hover: '#ff0000' },
      arrows: { to: { enabled: true, scaleFactor: 1 } },
      smooth: { type: 'cubicBezier', roundness: 0.2 },
      font: { align: 'top', size: 12 },
    },
    nodes: {
      shape: 'dot',
      size: 20,
      font: { size: 14, face: 'Arial' },
    },
    interaction: {
      dragNodes: true,
      hover: true,
      selectConnectedEdges: false,
      zoomView: true,  // Enable zooming
    },
    physics: {
      enabled: false,
      stabilization: { enabled: true, iterations: 300, updateInterval: 50 },
    },
    autoResize: true,
  };

  const graphData = {
    nodes: filteredNodes.map(node => {
      let label = node.label;

      // Apply the file path shortening for file nodes
      if (node.type === 'file' && node.label !== 'comb-file') {
        label = formatFilePath(node.label);
      }

      // Define colors based on node rank
      const rankColors = {
        0: "rgb(151, 194, 252)",  // Default light blue for rank 0
        1: "rgb(255, 200, 200)",  // Light red for rank 1
        2: "rgb(200, 255, 200)",  // Light green for rank 2
        3: "rgb(200, 200, 255)",  // Light purple for rank 3
        4: "rgb(255, 255, 200)",  // Light yellow for rank 4
        5: "rgb(255, 180, 180)"   // Custom color for rank 5, add more as needed
      };

      // Get the color based on the rank, fallback to default if undefined
      const nodeColor = rankColors[node.rank] || "rgb(151, 194, 252)";

      return {
        id: node.id,
        label: label,
        title: node.type === 'file' ? node.label : '', // Full path shown on hover
        x: node.x,
        y: node.y,
        shape: node.type === 'process' ? 'circle' :
               node.type === 'socket' ? 'diamond' :
               'box', // File node is represented as a box
        size: node.type === 'socket' ? 40 : 20,
        font: { size: node.type === 'socket' ? 10 : 14, vadjust: node.type === 'socket' ? -50 : 0 },
        color: {
          background: node.transparent ? `rgba(${nodeColor}, 0.5)` : nodeColor, // 50% opacity if transparent
          border: "#2B7CE9", // Border color remains the same
          highlight: { background: node.transparent ? `rgba(${nodeColor}, 0.3)` : "#D2E5FF", border: "#2B7CE9" },
        },
        className: node.transparent && !showTransparent ? 'transparent' : '',
      };
    }),

    edges: filteredEdges.map(edge => ({
      from: edge.source,
      to: edge.target,
      label: edge.label,
      color: edge.alname && edge.transparent ? '#ff9999' : // Light red for both alname and transparent
              edge.alname ? '#ff0000' :                  // Bright red for alname only
              edge.transparent ? '#d3d3d3' :             // Light gray for transparent only
              '#000000',                                // Black for neither
      id: `${edge.source}-${edge.target}`,
      font: { size: 12, align: 'horizontal', background: 'white', strokeWidth: 0 },
      className: edge.transparent && !showTransparent ? 'transparent' : '',
    })),
  };

  return (
    <div className="network-container">
      <button className="toggle-button" onClick={toggleTransparentEdges}>
        {showTransparent ? "Hide Transparent Edges" : "Show Transparent Edges"}
      </button>

      {/* Alert Details Card */}
      {alertDetails && (
        <Card className="alert-details-card" sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6">{alertDetails.name} Details</Typography>
            <Typography><strong>ID:</strong> {alertDetails.id}</Typography>
            <Typography><strong>Description:</strong> {alertDetails.description}</Typography>
            <Typography><strong>Severity:</strong> {alertDetails.severity}</Typography>
            <Typography><strong>Machine:</strong> {alertDetails.machine}</Typography>
            <Typography><strong>Occured On:</strong> {alertDetails.occured_on}</Typography>
            <Typography><strong>Program:</strong> {alertDetails.program}</Typography>
          </CardContent>
        </Card>
      )}

      <div id="network-visualization">
        <Graph
          key={uuid()}
          graph={graphData}
          options={options}
          events={{ 
            selectNode: handleNodeClick,
          }}
        />
        {clickedNode && (
          <Rnd default={{ x: 150, y: 150, width: 300, height: 200 }} bounds="parent">
            <div className="popup popup-node">
              <button className="close-button" onClick={handleClosePopup}>X</button>
              <h4>Node Details</h4>
              <p>ID: {clickedNode.id}</p>
              <p>Label: {clickedNode.label}</p>
              <p>Type: {clickedNode.type}</p>
              {clickedNode.nodes && clickedNode.nodes.length > 0 && (
                <>
                  <p>Connected Nodes:</p>
                  <ul>
                    {clickedNode.nodes.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Rnd>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
