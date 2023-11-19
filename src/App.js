
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserJoinForm from './UserJoinForm';
import DrawingCanvas from './DrawingCanvas';
import io from "socket.io-client";

const server = "http://localhost:3000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);


const App = () => {


  const uuid = () => {
    var S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };
  return (
    
      <Routes>
        
        <Route path="/user-join" element={<UserJoinForm uuid={uuid} />} />
        <Route path="/drawing-canvas" element={<DrawingCanvas />} />
      </Routes>
    
  );
};

export default App;
