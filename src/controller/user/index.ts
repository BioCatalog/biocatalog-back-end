import { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'modelagem';

export default class UserController {

    static async getAll(req: Request, res: Response) {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('cliente');

            const resul = await collection.find().toArray();

            if (resul.length > 0) {
                res.status(200).json({ resul });
            } else {
                res.status(404).json({ error: 'Nenhum dado encontrado' });
            }
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
        } finally {
            await client.close();
        }
    }

    static async getById(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'O id é obrigatório' });
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('cliente');

            const user = await collection.findOne({ _id: new ObjectId(id) });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.json(user);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar o usuário', details: err.message });
        } finally {
            await client.close();
        }
    }

    static async registerUser(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { name, form, email, passw } = req.body;

        if (!name || !form || !email || !passw) {
            return res.status(400).json({ error: 'Nome, formação, email e senha são obrigatórios' });
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('cliente');

            const newUser = { name, form, email, passw };

            const result = await collection.insertOne(newUser);

            if (result.acknowledged) {
                res.status(201).json({ message: 'Usuário inserido com sucesso', userId: result.insertedId });
            } else {
                res.status(500).json({ error: 'Erro ao inserir o usuário' });
            }

        } catch (err) {
            res.status(500).json({ error: 'Erro ao inserir o usuário', details: err.message });

        } finally {
            await client.close();
            
        }
    }

}