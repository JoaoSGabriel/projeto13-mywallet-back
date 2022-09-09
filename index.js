import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import joi from 'joi';
import { v4 as uuid } from 'uuid';
import { MongoClient, ObjectId } from 'mongodb';
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

const spentSchema = joi.object({
    date: joi.date().required(),
    description: joi.string().min(5).max(60).required(),
    value: joi.number().required(),
    type: joi.string().valid('entrada', 'saída')
});

server.post('/sign-up', async (req, res) => {
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
/* Utilizado para verificação de participantes*/

server.post('/sign-in', async (req, res) => {
    const singIn = req.body;

    const validation = loginSchema.validate(singIn, { abortEarly: false });
    if (validation.error) {
        return res.status(401).send(validation.error.details.map(value => value.message));
    }
    try {
        const promisse = await db.collection("users").findOne({email: singIn.email});
        if (promisse && bcrypt.compareSync(singIn.password, promisse.password)) {
            const token = uuid();
            await db.collection("sessions").insertOne({
                userID: promisse._id,
                token
            });
            const answer = {
                name: promisse.name,
                token
            }
            return res.status(200).send(answer);
        } else {
            return res.status(404).send({error: 'Usuário inexistente'});
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.post('/new-spent', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    const {date, description, value, type} = req.body;

    const validation = spentSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        return res.status(401).send(validation.error.details.map(value => value.message));
    }
    try {
        const session = await db.collection("sessions").findOne({token});
        if (!session) return res.sendStatus(401);

        const user = await db.collection("users").findOne({_id: session.userID});
        if (!user) return res.sendStatus(401);

        await db.collection("wallet").insertOne({
            date: date,
            description: description,
            value: value,
            type: type,
            name: user.name});
        res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.get('/my-wallet', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection("sessions").findOne({token});
        if (!session) return res.sendStatus(401);

        const user = await db.collection("users").findOne({_id: session.userID});
        if (!user) return res.sendStatus(401);

        const promisse = await db.collection("wallet").find().toArray();

        const answer = promisse.filter(value => value.name === user.name)
        res.send(answer);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.delete('/my-wallet/:id', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    const { id } = req.params;

    try {
        const promisse = await db.collection("wallet").findOne({_id: new ObjectId(id)})
        if (promisse === null) return res.sendStatus(404);

        await db.collection("wallet").deleteOne({_id: new ObjectId(id)});
        res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.put('/my-wallet/:id', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    const {id} = req.params;

    try {
        const promisse = await db.collection("wallet").findOne({_id: new ObjectId(id)})
        if (promisse === null) return res.sendStatus(404);

        await db.collection("wallet").updateOne({_id: new ObjectId(id)}, {$set: req.body});
        res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

server.listen(5000, () => console.log('Listen on port 5000'));