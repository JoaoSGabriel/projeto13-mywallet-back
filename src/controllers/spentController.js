import db from '../db.js';
import { spentSchema } from '../schemas/spentSchema.js';
import { ObjectId } from 'mongodb';

export async function createSpent(req, res) {
    const {date, description, value, type} = req.body;

    const validation = spentSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        return res.status(401).send(validation.error.details.map(value => value.message));
    }
    try {
        const user = res.locals.user;

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
};

export async function getSpent(req, res) {
    try {
        const user = res.locals.user;

        const promisse = await db.collection("wallet").find().toArray();

        const answer = promisse.filter(value => value.name === user.name)
        res.send(answer);
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

export async function deleteSPent(req, res) {
    const { id } = req.params;

    try {
        const promisse = await db.collection("wallet").findOne({_id: new ObjectId(id)})
        if (promisse === null) return res.sendStatus(404);

        await db.collection("wallet").deleteOne({_id: new ObjectId(id)});
        res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

export async function updateSpent(req, res) {
    const {id} = req.params;

    try {
        const promisse = await db.collection("wallet").findOne({_id: new ObjectId(id)})
        if (promisse === null) return res.sendStatus(404);

        await db.collection("wallet").updateOne({_id: new ObjectId(id)}, {$set: req.body});
        res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error.message);
    }
};