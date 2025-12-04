const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar conexão com o banco Neon
// A Vercel cria a variável DATABASE_URL automaticamente quando você conecta o projeto
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.'));

// ==================================================================
// INICIALIZAÇÃO DO BANCO DE DADOS
// ==================================================================

async function initDB() {
    try {
        // Cria a tabela se não existir (Sintaxe PostgreSQL)
        await sql`
            CREATE TABLE IF NOT EXISTS gifts (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                presente TEXT NOT NULL,
                link TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Banco de dados Neon conectado e tabela verificada!');
    } catch (error) {
        console.error('Erro ao conectar no banco:', error);
    }
}

// Inicializar a tabela ao arrancar o servidor
initDB();

// ==================================================================
// ROTAS DA API
// ==================================================================

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Buscar todos os presentes
app.get('/api/gifts', async (req, res) => {
    try {
        const rows = await sql`SELECT * FROM gifts ORDER BY created_at DESC`;
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar presentes:', err);
        res.status(500).json({ error: 'Erro ao buscar presentes' });
    }
});

// Adicionar presente
app.post('/api/gifts', async (req, res) => {
    const { nome, presente, link } = req.body;

    if (!nome || !presente || !link) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    try {
        // Inserir e retornar o item criado
        const rows = await sql`
            INSERT INTO gifts (nome, presente, link) 
            VALUES (${nome}, ${presente}, ${link}) 
            RETURNING *
        `;
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao inserir presente:', err);
        res.status(500).json({ error: 'Erro ao adicionar presente' });
    }
});

// Deletar presente
app.delete('/api/gifts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql`DELETE FROM gifts WHERE id = ${id}`;
        res.json({ message: 'Presente deletado com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar presente:', err);
        res.status(500).json({ error: 'Erro ao deletar presente' });
    }
});

// Exportar para Vercel
module.exports = app;

// Iniciar servidor localmente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}