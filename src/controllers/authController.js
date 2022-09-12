import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { createSchema, loginSchema } from '../schemas/authSchema.js';

export async function signUp(req, res) {
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
};

export async function signIn(req, res) {
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
};