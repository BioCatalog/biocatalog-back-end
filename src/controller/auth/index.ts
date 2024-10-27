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

            const verify = await collection.findOne({ email: email });

            if (verify) {
                console.log(verify);
                res.status(401).json({ error: "Conta já existente" });
                return;
            }

            const newUser = { name, form, email, password: bcrypt.hashSync(password, 10), token: { token: '', expiresAt: '', refreshToken: '' } };

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

            if (!user) { res.status(401).json({ error: "Usuário ou senha inválida" }); return; }

            const passCheck = await bcrypt.compareSync(password, user.password);

            if (!passCheck) { res.status(401).json({ error: "Usuário ou senha inválida" }); return; }

            const stringRand = user.id + new Date().toString()
            const token = bcrypt.hashSync(stringRand, 1).slice(-20);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            const refreshToken = bcrypt.hashSync(stringRand + 2, 1).slice(-20);

            await collection.updateOne({ email: email },
                {
                    $set: {
                        "token": { token, expiresAt, refreshToken }
                    }
                });

            res.json({
                token: token,
                expiresAt: expiresAt,
                refreshToken: refreshToken,
                user: user
            });
            return
        } catch (err) {
            res.status(500).json({ error: 'Erro ao inserir o usuário', details: err });

        } finally {
            await client.close();
        }
    }

    static async logout(req: Request, res: Response) {
        const client = new MongoClient(url);
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Informe o usuário!' });
            return;
        }

        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('usuario');

            const user = await collection.findOne({ email: email });

            if (!user) { res.status(401).json({ error: "Usuário inválido" }); return; }

            await collection.updateOne({ email: email },
                {
                    $unset: {
                        "token": "exclude"
                    }
                });

            res.status(200).json({ "message": "Logout efetuado com sucesso" });
            return
        } catch (err) {
            res.status(500).json({ error: 'Erro ao inserir o usuário', details: err });

        } finally {
            await client.close();
        }
    }
}