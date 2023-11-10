import React, { useState, useRef, useEffect } from 'react';
import './DrawingCanvas.css';

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [highlighterMode, setHighlighterMode] = useState(false);
  const [lineThickness, setLineThickness] = useState(2); // Default thickness is 2



  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
  }, []);

  const startDrawing = (e) => {
    if (context) {
      context.beginPath();
      context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setDrawing(true);
    }
  };

  const draw = (e) => {
    console.log('Draw called');
    if (!drawing || !context) return;
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (highlighterMode) {
        context.globalAlpha = 0.02;  // for adjusting the intensity 
        context.strokeStyle = 'yellow';
        context.lineWidth = 10;
      } else {
        context.globalAlpha = 1;
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.lineWidth = lineThickness; // Use line thickness from state
      }

    if (eraserMode) {
      context.clearRect(
        e.nativeEvent.offsetX - lineThickness / 2,
        e.nativeEvent.offsetY - lineThickness / 2,
        lineThickness,
        lineThickness
      )

    } else {
      context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setDrawing(false);
    }
  };
  //eraser
  const toggleEraserMode = () => {
    setEraserMode(!eraserMode);
  };
  //clear canvas feature
  const clearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
  //highlighter 
  const toggleHighlighterMode = () => {
    setHighlighterMode(!highlighterMode);
  };

  //Thickness
  const handleThicknessChange = (event) => {
    console.log('Handle Thickness Change called');
    const newThickness = parseInt(event.target.value, 10);
    setLineThickness(newThickness);
  };
  
  
  
  
  return (
    <div>
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        border: '2px solid black', 
        borderRadius: '5px',
        margin:'0 auto',
        display:'block' 
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
    />
    <div style={{ marginTop: '10px' }} className="thickness-input">
        <label htmlFor="thicknessRange">Line Thickness:</label>
        <input
          id="thicknessRange"
          type="range"
          min="1"
          max="20"
          value={lineThickness}
          onChange={handleThicknessChange}
          //className='thickness-input'
        />
        <span style={{ marginLeft: '5px' }}>{lineThickness}</span>
      </div>
    <button onClick={toggleEraserMode} className="eraser-button">
        {eraserMode ? 'Disable Eraser' : 'Enable Eraser'}
      </button>

    <button onClick={clearCanvas} className='clear-canvas-button'>Clear Canvas</button>
    <button onClick={toggleHighlighterMode} className='highlighter-button'>
        {highlighterMode ? 'Disable Highlighter' : 'Enable Highlighter'}
    </button>
   



    </div>
  );
}

export default DrawingCanvas;
