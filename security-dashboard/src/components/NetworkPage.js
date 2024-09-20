import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import './NetworkPage.css';
import { toPng } from 'html-to-image';

const NetworkPage = () => {
  const { alertId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedNode, setClickedNode] = useState(null); // State to store clicked node details
  const fgRef = useRef(); // Reference to the graph for exporting as PNG

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    setLoading(true);

    axios.get(`http://127.0.0.1:5000/api/network/${alertId}`)
      .then(response => {
        const { nodes, edges } = response.data;

        // Sort edges based on time
        const sortedEdges = edges.sort((a, b) => new Date(a.time) - new Date(b.time));

        // Group nodes by rank
        const nodesByRank = nodes.reduce((acc, node) => {
          const rank = node.rank || 0;
          if (!acc[rank]) acc[rank] = [];
          acc[rank].push(node);
          return acc;
        }, {});

        // Define positions based on rank
        const rankSpacingX = 100;  // Horizontal spacing between ranks
        const ySpacing = 50;  // Vertical spacing between nodes

        const nodePositions = {};

        Object.keys(nodesByRank).forEach(rank => {
          const nodesInRank = nodesByRank[rank];

          // Sort nodes in the same rank based on edge count
          nodesInRank.sort((a, b) => {
            const aEdges = edges.filter(edge => edge.source === a.id || edge.target === a.id);
            const bEdges = edges.filter(edge => edge.source === b.id || edge.target === b.id);
            return aEdges.length - bEdges.length;
          });

          const totalNodesInRank = nodesInRank.length;

          // Set x and y positions for nodes based on rank
          nodesInRank.forEach((node, index) => {
            nodePositions[node.id] = {
              x: rank * rankSpacingX,  // Horizontal position based on rank
              y: index * ySpacing - (totalNodesInRank * ySpacing) / 2,  // Center vertically within rank
            };
          });
        });

        // Apply positions to nodes
        const positionedNodes = nodes.map(node => ({
          ...node,
          x: nodePositions[node.id].x,
          y: nodePositions[node.id].y,
        }));

        setNodes(positionedNodes);
        setEdges(sortedEdges);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching network data:', error);
        setLoading(false);
      });
  }, [alertId]);

  // Define colors for each rank
  const rankColors = {
    1: '#FF5733',  // Rank 1: Red
    2: '#33FF57',  // Rank 2: Green
    3: '#3357FF',  // Rank 3: Blue
    4: '#FFC300',  // Rank 4: Yellow
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const graphData = {
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.label,
      x: node.x,  // Custom x position
      y: node.y,  // Custom y position
      size: 10,
      rank: node.rank,  // Pass the rank property to the node
      shape: node.type === 'process' ? 'circle' : 
             node.type === 'socket' ? 'diamond' : 
             'box',  // Assign shape based on node type
    })),
    links: edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.label,
      alname: edge.alname, // Add alname field to the edges
      transparent: edge.transparent, // Add transparent field to the edges
    })),
  };

  // Handle node click to display details
  const handleNodeClick = (node) => {
    setClickedNode(node); // Set the clicked node details to state
  };



  // Function to export the graph as PNG
  const exportToPNG = () => {
  // const canvas = fgRef.current.renderer().domElement;  // Access the canvas element
  // const link = document.createElement('a');
  // link.href = canvas.toDataURL('image/png');
  // link.download = 'graph.png';
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
  const networkVisualization = document.getElementById('network-visualization');
  toPng(networkVisualization)
    .then((dataUrl) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'network-graph.png';
      link.click();
    })
    .catch((error) => {
      console.error('Error exporting image:', error);
    });
};


  return (
    <div>
      <div className="network-visualization">
      <ForceGraph2D
        ref={fgRef}  // Reference for exporting PNG
        graphData={graphData}
        enableNodeDrag={false}  // Disable dragging, which triggers physics
        cooldownTicks={0}       // Stop the simulation immediately
        d3AlphaMin={0.1}        // Disable the alpha force parameter (no more forces after initial layout)
        d3VelocityDecay={0.9}  
        nodeAutoColorBy="group"  // Optionally, color nodes by groups or rank
        linkDirectionalArrowLength={6}
        linkDirectionalParticles={2}
        onNodeClick={handleNodeClick}  // Set node click handler
        // Custom node rendering based on shape
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Set the node color based on its rank
          const nodeColor = rankColors[node.rank] || '#007bff';  // Default color if rank isn't defined
          ctx.fillStyle = nodeColor;

          // Draw custom shapes based on node type
          if (node.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);  // Circle shape
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
          } else if (node.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y - 10);  // Diamond shape
            ctx.lineTo(node.x + 10, node.y);
            ctx.lineTo(node.x, node.y + 10);
            ctx.lineTo(node.x - 10, node.y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
          } else {
            ctx.fillRect(node.x - 10, node.y - 10, 20, 20);  // Box shape
            ctx.strokeStyle = 'black';
            ctx.strokeRect(node.x - 10, node.y - 10, 20, 20);
          }

          // Optionally, display the label on hover or clicked nodes
          if (clickedNode === node || globalScale > 1.5) {
            ctx.fillText(label, node.x, node.y - 15);  // Label the node above the shape
          }
        }}
        linkCanvasObjectMode={() => 'after'}  // Edge label rendering mode
        linkCanvasObject={(link, ctx, globalScale) => {
          // Set edge color based on alname and transparent condition
          const edgeColor = link.alname && link.transparent ? '#ff9999' : // Light red for both alname and transparent
                            link.alname ? '#ff0000' :                  // Bright red for alname only
                            link.transparent ? '#d3d3d3' :             // Light gray for transparent only
                            '#000000';                                // Black for neither

          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = 2;  // Set the edge thickness

          // Draw the edge line
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();

          // Optionally, display the label on clicked edges
          const label = link.label;
          if (clickedNode === link || globalScale > 1.5) {
            const midX = (link.source.x + link.target.x) / 2;
            const midY = (link.source.y + link.target.y) / 2;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText(label, midX, midY);
          }
        }}
      />
      </div>

      {/* Display node details */}
      {clickedNode && (
        <div className="node-details">
          <h3>Node Details</h3>
          <p><strong>ID:</strong> {clickedNode.id}</p>
          <p><strong>Label:</strong> {clickedNode.name}</p>
        </div>
      )}
      {/* Export Button */}
      <button onClick={exportToPNG} className="export-button">Export to PNG</button>
    </div>
  );
};

export default NetworkPage;
