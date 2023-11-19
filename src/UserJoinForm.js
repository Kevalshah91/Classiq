// UserJoinForm.js
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './UserForms.css';

const UserJoinForm = ({uuid}) => {
    const [joinFormData, setJoinFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const [createRoomFormData, setCreateRoomFormData] = useState({
        roomName: '',
        roomCode: '',
    });

    useEffect(() => {
        
        generateRoomCode();
    }, []); 

    const submitJoinForm = () => {
        const { fullName, email, password } = joinFormData;

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        console.log('Join Form Data:');
        console.log('Full Name:', fullName);
        console.log('Email:', email);
        console.log('Password:', password);
    };

    const createRoom = () => {
        const { roomName, roomCode } = createRoomFormData;

        if (roomName.trim() === '') {
            alert('Please enter a room name.');
            return;
        }

        console.log('Create Room Form Data:');
        console.log('Room Name:', roomName);
        console.log('Room Code:', roomCode);
    };

    const generateRoomCode = () => {
        const roomCode = uuidv4();
        

        setCreateRoomFormData((prevData) => ({
            ...prevData,
            roomCode: roomCode,
        }));
    };

    const handleJoinFormChange = (e) => {
        const { name, value } = e.target;
        setJoinFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCreateRoomChange = (e) => {
        const { name, value } = e.target;
        setCreateRoomFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Example email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className="form-container">
            {/* User Join Form */}
            <form id="joinForm">
                <h2>User Join Form</h2>
                <label htmlFor="fullName">Full Name:</label>
                <input type="text" id="fullName" name="fullName" value={joinFormData.fullName} onChange={handleJoinFormChange} required />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={joinFormData.email} onChange={handleJoinFormChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={joinFormData.password} onChange={handleJoinFormChange} required />

                <button type="button" onClick={submitJoinForm}>
                    Join Now
                </button>
            </form>

            {/* Create Room Form */}
            <form id="createRoomForm">
                <h2>Create Room Form</h2>
                <label htmlFor="roomName">Room Name:</label>
                <input type="text" id="roomName" name="roomName" value={createRoomFormData.roomName} onChange={handleCreateRoomChange} required />

                <label htmlFor="roomCode">Room Code:</label>
                <input type="text" id="roomCode" name="roomCode" value={createRoomFormData.roomCode} readOnly />

                <button type="button" onClick={generateRoomCode}>
                    Generate Room Code
                </button>

                <button type="button" onClick={createRoom}>
                    Create Room
                </button>
            </form>
        </div>
    );
};

export default UserJoinForm;
