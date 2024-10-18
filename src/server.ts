import express from 'express';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(routes);
app.listen(port, async () => {
    console.log(`Servidor rodando na porta ${port}`);
});

