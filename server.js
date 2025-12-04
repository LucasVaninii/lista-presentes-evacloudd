const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configurado para aceitar requisições de qualquer origem
// Em produção, você pode restringir para domínios específicos
app.use(cors({
    origin: '*', // Aceita requisições de qualquer origem (incluindo GitHub Pages)
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.'));

// Inicializar banco de dados
const dbPath = path.join(__dirname, 'gifts.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        
        // Criar tabela se não existir
        db.run(`CREATE TABLE IF NOT EXISTS gifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            presente TEXT NOT NULL,
            link TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err);
            } else {
                console.log('Tabela de presentes criada/verificada');
            }
        });
    }
});

// Rota para servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para obter todos os presentes
app.get('/api/gifts', (req, res) => {
    db.all('SELECT * FROM gifts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar presentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar presentes', message: err.message });
        }
        res.json(rows);
    });
});

// Rota para adicionar um presente
app.post('/api/gifts', (req, res) => {
    const { nome, presente, link } = req.body;

    // Validação
    if (!nome || !presente || !link) {
        return res.status(400).json({ 
            error: 'Dados incompletos', 
            message: 'Nome, presente e link são obrigatórios' 
        });
    }

    // Validar URL
    try {
        new URL(link);
    } catch (e) {
        return res.status(400).json({ 
            error: 'URL inválida', 
            message: 'Por favor, forneça uma URL válida' 
        });
    }

    // Inserir no banco de dados
    db.run(
        'INSERT INTO gifts (nome, presente, link) VALUES (?, ?, ?)',
        [nome.trim(), presente.trim(), link.trim()],
        function(err) {
            if (err) {
                console.error('Erro ao inserir presente:', err);
                return res.status(500).json({ 
                    error: 'Erro ao adicionar presente', 
                    message: err.message 
                });
            }

            // Retornar o presente criado
            db.get('SELECT * FROM gifts WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    console.error('Erro ao buscar presente criado:', err);
                    return res.status(500).json({ 
                        error: 'Presente adicionado mas erro ao retornar dados' 
                    });
                }
                res.status(201).json(row);
            });
        }
    );
});

// Rota para deletar um presente (opcional - para futuras funcionalidades)
app.delete('/api/gifts/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Erro ao deletar presente:', err);
            return res.status(500).json({ 
                error: 'Erro ao deletar presente', 
                message: err.message 
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({ 
                error: 'Presente não encontrado' 
            });
        }

        res.json({ message: 'Presente deletado com sucesso' });
    });
});

// Exportar app para Vercel (serverless)
module.exports = app;

// Iniciar servidor apenas se não estiver rodando no Vercel
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Acesse http://localhost:${PORT} no seu navegador`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar banco de dados:', err);
            } else {
                console.log('Conexão com banco de dados fechada');
            }
            process.exit(0);
        });
    });
}
