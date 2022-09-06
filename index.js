import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import joi from 'joi';
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

const createSchema = joi.object({
    name: joi.string().alphanum().required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: joi.ref('password')
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
});

server.post('/sing-up', async (req, res) => {
    const singUp = req.body;

    const validation = createSchema.validate(singUp, { abortEarly: false });
    if (validation.error) {
        return res.status(401).send(validation.error.details.map(value => value.message));
    }
    try {
        const promisse = await db.collection("users").findOne({name: singUp.name});
        if (promisse === null) {
            const cryptPassword = bcrypt.hashSync(singUp.password, 10);

            await db.collection("users").insertOne({
                name: singUp.name,
                email: singUp.email,
                password: cryptPassword
            });
            res.sendStatus(201);
        } else {
            return res.status(409).send({error: 'Este usuário já existe!'});
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

/* Utilizado para verificação de participantes*/
server.get('/users', (req, res) => {
    db.collection("users").find().toArray().then(users => {
        res.send(users);
    });
});

server.post('/sing-in', async (req, res) => {
    const singIn = req.body;

    const validation = loginSchema.validate(singIn, { abortEarly: false });
    if (validation.error) {
        return res.status(401).send(validation.error.details.map(value => value.message));
    }
    try {
        const promisse = await db.collection("users").findOne({email: singIn.email});
        if (promisse === null) {
            return res.status(404).send({error: 'Usuário inexistente'});
        }
        
        const password = bcrypt.compareSync(singIn.password, promisse.password);
        if(password) {
            return res.status(200).send(promisse);
        } else {
            return res.sendStatus(406);
        }
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