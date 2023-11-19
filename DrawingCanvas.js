import React, { useState, useRef, useEffect } from 'react';
import './DrawingCanvas.css';
import LaserCanvas from './LaserCanvas';
import ImageUpload from './ImageUpload';
import io from "socket.io-client";


function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [highlighterMode, setHighlighterMode] = useState(false);
  const [penMode, setPenMode] = useState(false);
  const [laserPointerMode, setLaserPointerMode] = useState(false);

  const [shapeMode, setShapeMode] = useState(false);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
  const socket = io("http://localhost:5000"); 

 

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
    socket.on("drawing", (imageData) => {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    });

    return () => {
      socket.disconnect(); // Clean up socket connection on component unmount
    };
  }, [socket]);
  

  const startDrawing = (e) => {
    if (context) {
      context.beginPath();
      if (shapeMode) {
        setShapeStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      } else {
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
      setDrawing(true);
  
    }
  };
  const draw = (e) => {
    if (!drawing || !context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (laserPointerMode) {
      
      //context.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
      const radius = 20;
      const gradient = context.createRadialGradient(
        offsetX,offsetY,0,
        offsetX,offsetY,radius
      );
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(1, 'transparent');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(offsetX, offsetY, radius, 0, 2 * Math.PI);
      context.strokeStyle = 'transparent';
      
      context.fill();
      context.closePath();
 
    }
    if (penMode) {
      context.globalAlpha = 1;
      context.strokeStyle = 'black';
      context.lineWidth = 0.5;
      context.lineTo(offsetX, offsetY);
      context.stroke();
    }else if (shapeMode) {
      // Drawing a shape 
      const width = offsetX - shapeStart.x;
      const height = offsetY - shapeStart.y;
  
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.globalAlpha = highlighterMode ? 0.02 : 1;
      context.strokeStyle = highlighterMode ? 'yellow' : 'black';
      context.lineWidth = highlighterMode ? 10 : 2;
  
      // Draw the rectangle
      context.strokeRect(shapeStart.x, shapeStart.y, width, height);
    }  
    else {
      if (highlighterMode) {
        context.globalAlpha = 0.02;  // for adjusting the intensity 
        context.strokeStyle = 'yellow';
        context.lineWidth = 10;
      } else {
        context.globalAlpha = 1;
        context.strokeStyle = 'black';
        context.lineWidth = 2;
      }

      if (eraserMode) {
        context.clearRect(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 10, 10);
      } else {
        context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        context.stroke();
      }
    }
    const imageData = canvasRef.current.toDataURL();
    socket.emit("drawing", imageData);
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setDrawing(false);
    }
  };

  const toggleEraserMode = () => {
    setEraserMode(!eraserMode);
  };

  const clearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const toggleHighlighterMode = () => {
    setHighlighterMode(!highlighterMode);
  };

  const togglePenMode = () => {
    setPenMode(!penMode);
  };

  const toggleShapeMode = () => {
    setShapeMode(!shapeMode);
    setPenMode(false); // Disable pen mode when switching to shape mode
  };
  //laser pointer 
  const toggleLaserPointerMode = () => {
    setLaserPointerMode(!laserPointerMode);
  };
  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
      };

      reader.readAsDataURL(file);
    }
  };





  return (
    <div className="canvas-container">
      <div className="toolbox">
        <button onClick={toggleEraserMode} className="eraser-button">
          {eraserMode ? 'Disable Eraser' : 'Enable Eraser'}
        </button>
        <button onClick={clearCanvas} className='clear-canvas-button'>
          Clear Canvas
        </button>
        <button onClick={toggleHighlighterMode} className='highlighter-button'>
          {highlighterMode ? 'Disable Highlighter' : 'Enable Highlighter'}
        </button>
        <button onClick={togglePenMode} className="pen-button">
          {penMode ? 'Disable Pen' : 'Enable Pen'}
        </button>
        <button onClick={toggleShapeMode} className="shape-button">
          {shapeMode ? 'Disable Shape' : 'Enable Shape'}
        </button>
        <button onClick={toggleLaserPointerMode} className="laser-pointer-button">
          {laserPointerMode ? 'Disable Laser Pointer' : 'Enable Laser Pointer'}
        </button>


        {laserPointerMode && <LaserCanvas context={context} />}
        <ImageUpload onImageUpload={handleImageUpload} />
        
        
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        className='canvas-board'
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
    
      />
      {/*  calculator div */}
      <div id="calculator" style={{ width: '600px', height: '400px' }}></div>
    </div>
  );
}

export default DrawingCanvas;
