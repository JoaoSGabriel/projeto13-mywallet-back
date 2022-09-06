import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("mywallet");
});

server.post('/sing-up', async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.post('/sing-in', async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.get('/mywallet', async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.post('/new-entry', async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.post('/new-output', async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.listen(5000, () => console.log('Listen on port 5000'));