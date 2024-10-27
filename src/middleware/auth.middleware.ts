import { Request, Response, NextFunction } from 'express'
import { MongoClient } from 'mongodb';
import { dbName, url } from '../constants';

export default async function authMiddleware 
(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({error: 'Token não informado'});

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('usuario');

        const userToken = await collection.findOne({ "token.token": authorization });
        
        if (!userToken) return res.status(401).json({error: 'Token não encotrado'});
        
        if (userToken.expiresAt < new Date()){
            await userToken.remove();
            return res.status(401).json({error: 'Login expirado'});
        }
    
        req.headers.userId = userToken.userId.toString();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Erro ao realiar autenticação', details: err });
    } finally {
        await client.close();
    }
}