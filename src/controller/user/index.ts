import { Request, Response } from 'express';
import { MongoClient } from "mongodb";

export default class UserController {
    static async getAll(req: Request, res: Response) {
        const url = 'mongodb://localhost:27017';

        const dbName = 'modelagem';

        const client = new MongoClient(url);

        const db = client.db(dbName);
        
        const collection = db.collection('cliente');

        const resul = await collection.find().toArray();

        if(resul) {
            res.status(200).json({resul});
            return;
        } else {    
            res.status(401).json({err: 'Nenhum dado encontrado'});
            return;
        }
    }

    static async getById(req: Request, res: Response) {
        
    }
}