import React from 'react';
import DrawingCanvas from './DrawingCanvas'; 
function App() {
  return (
    <div>
      <h1>White board</h1>
      <DrawingCanvas /> {/* Render the DrawingCanvas component */}
      {/* You can add other components or HTML elements here */}
    </div>
  );
}
export default App;
