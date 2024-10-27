import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { dbName, url } from "../../constants";
import bcrypt from 'bcrypt'

export default class AuthController {
    static async register(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { name, form, email, password } = req.body;

        if (!name || !form || !email || !password) {
            res.status(400).json({ error: 'Nome, formação, email e senha são obrigatórios' });
            return;
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('usuario');

            const newUser = { name, form, email, password };

            const result = await collection.insertOne(newUser);

            if (result.acknowledged) {
                res.status(201).json({ message: 'Usuário inserido com sucesso', userId: result.insertedId });
            } else {
                res.status(500).json({ error: 'Erro ao inserir o usuário' });
            }

        } catch (err) {
            res.status(500).json({ error: 'Erro ao inserir o usuário', details: err });

        } finally {
            await client.close();

        }
    }

    static async login(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Informe suas credenciais!' });
            return;
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('usuario');

            const user = await collection.findOne({ email: email });

            if(!user) { res.status(401).json({error: "Usuário ou senha inválida"}); return; }

            const passCheck = await bcrypt.compareSync(password, user.password);

            if(!passCheck) { res.status(401).json({error: "Usuário ou senha inválida"}); return; }

            const stringRand = user.id + new Date().toString()
            const token = bcrypt.hashSync(stringRand, 1).slice(-20);
            const expiresAt = new Date(Date.now() + 60*60*1000);
            const refreshToken = bcrypt.hashSync(stringRand+2, 1).slice(-20);

            await collection.updateOne({ nome: email }, 
                { $set: { "token.token": token, "token.expiresAt": expiresAt, "token.refreshToken": refreshToken } });
            
            res.json({
                token: token,
                expiresAt: expiresAt,
                refreshToken: refreshToken
            });
            return
        } catch (err) {
            res.status(500).json({ error: 'Erro ao inserir o usuário', details: err });

        } finally {
            await client.close();

        }
    }
}