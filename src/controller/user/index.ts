import { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { dbName, url } from '../../constants';
export default class UserController {

    static async getAll(req: Request, res: Response) {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('usuario');

            const resul = await collection.find().toArray();

            if (resul.length > 0) {
                res.status(200).json({ resul });
            } else {
                res.status(404).json({ error: 'Nenhum dado encontrado' });
            }
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar dados', details: err });
        } finally {
            await client.close();
        }
    }

    static async getById(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: 'O id é obrigatório' });
            return;
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('usuario');

            const user = await collection.findOne({ _id: new ObjectId(id) });

            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }

            res.json(user);
            return;
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar o usuário', details: err });
        } finally {
            await client.close();
        }
    }
}
