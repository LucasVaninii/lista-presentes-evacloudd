// Configuração: API URL
// Esta URL conecta o frontend ao seu backend na Vercel
const API_URL = "https://lista-presentes-evacloudd.vercel.app/api";

// Chave para localStorage (backup)
const STORAGE_KEY = 'evacloudd_gifts';

// Se tiver API_URL, usa o backend (Neon). Se não, usa localStorage.
const USE_LOCALSTORAGE_ONLY = !API_URL;

// Carregar presentes ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadGifts();
    
    // Configurar formulário
    const form = document.getElementById('giftForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// ==================== FUNÇÕES DE ARMAZENAMENTO (BACKUP) ====================

function getGiftsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Erro localStorage:', error);
        return [];
    }
}

function saveGiftsToStorage(gifts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
    } catch (error) {
        console.error('Erro salvar localStorage:', error);
    }
}

function addGiftToStorage(gift) {
    const gifts = getGiftsFromStorage();
    const newGift = {
        id: Date.now(),
        nome: gift.nome,
        presente: gift.presente,
        link: gift.link,
        created_at: new Date().toISOString()
    };
    gifts.unshift(newGift);
    saveGiftsToStorage(gifts);
    return newGift;
}

// ==================== FUNÇÕES DE API (NEON) ====================

async function loadGiftsFromAPI() {
    if (!API_URL) return null;
    try {
        const response = await fetch(`${API_URL}/gifts`);
        if (response.ok) return await response.json();
    } catch (error) {
        console.log('API indisponível:', error);
    }
    return null;
}

async function addGiftViaAPI(giftData) {
    if (!API_URL) return null;
    try {
        const response = await fetch(`${API_URL}/gifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftData)
        });
        if (response.ok) return await response.json();
    } catch (error) {
        console.log('Erro API:', error);
    }
    return null;
}

// ==================== FUNÇÕES PRINCIPAIS ====================

async function loadGifts() {
    const loading = document.getElementById('loading');
    const giftsList = document.getElementById('giftsList');
    const emptyState = document.getElementById('emptyState');

    if (loading) loading.style.display = 'block';
    if (giftsList) giftsList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';

    let gifts = [];

    try {
        // Tenta carregar da API (Neon)
        if (!USE_LOCALSTORAGE_ONLY) {
            const apiGifts = await loadGiftsFromAPI();
            if (apiGifts) {
                gifts = apiGifts;
                saveGiftsToStorage(gifts); // Backup local
            } else {
                gifts = getGiftsFromStorage(); // Falha API
            }
        } else {
            gifts = getGiftsFromStorage();
        }
    } catch (e) {
        gifts = getGiftsFromStorage();
    }

    if (loading) loading.style.display = 'none';

    if (!gifts || gifts.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    // Ordenar por data
    gifts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    gifts.forEach(gift => {
        if (giftsList) giftsList.appendChild(createGiftCard(gift));
    });
}

function createGiftCard(gift) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    const date = new Date(gift.created_at).toLocaleDateString('pt-BR');

    // Só cria o botão se o link existir e não for vazio
    const linkButton = gift.link && gift.link !== "" 
        ? `<a href="${escapeHtml(gift.link)}" target="_blank" class="gift-link">Ver Presente →</a>` 
        : '';

    card.innerHTML = `
        <div class="gift-card-header">
            <div>
                <div class="gift-name">${escapeHtml(gift.presente)}</div>
                <div class="sugested-by">Sugerido por: ${escapeHtml(gift.nome)}</div>
                <div class="sugested-by" style="font-size: 0.75rem; margin-top:5px;">${date}</div>
            </div>
            <button onclick="deleteGift('${gift.id}')" class="btn-delete" title="Apagar Sugestão">
                🗑️
            </button>
        </div>
        ${linkButton}
    `;
    return card;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const presente = document.getElementById('presente').value.trim();
    // Se não tiver link, usa string vazia
    const link = document.getElementById('link').value.trim() || "";

    // Validação: Agora só Nome e Presente são obrigatórios
    if (!nome || !presente) {
        alert('Por favor, preencha o Nome e o Presente!');
        return;
    }

    const giftData = { nome, presente, link };
    let result = null;

    // Tentar salvar na API
    if (!USE_LOCALSTORAGE_ONLY) {
        result = await addGiftViaAPI(giftData);
    }

    // Se falhar ou não tiver API, salva local
    if (!result) {
        result = addGiftToStorage(giftData);
    } else {
        loadGifts(); 
    }

    document.getElementById('giftForm').reset();
    
    setTimeout(() => {
        loadGifts();
        alert('Presente adicionado com sucesso! 🎉');
    }, 500);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FUNÇÃO DE DELETAR ====================

// Tornar a função global para o HTML conseguir acessar
window.deleteGift = async function(id) {
    // Pergunta de segurança
    if (!confirm('Tem certeza que deseja apagar esta sugestão?')) {
        return;
    }

    try {
        // Se estiver usando API (Neon/Vercel)
        if (!USE_LOCALSTORAGE_ONLY) {
            const response = await fetch(`${API_URL}/gifts/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar no servidor');
            }
        } else {
            // Se estiver usando apenas LocalStorage (Backup)
            const gifts = getGiftsFromStorage();
            const updatedGifts = gifts.filter(gift => gift.id != id); // Remove o item
            saveGiftsToStorage(updatedGifts);
        }

        // Atualiza a tela
        loadGifts();
        alert('Sugestão apagada com sucesso!');

    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao tentar apagar. Tente novamente.');
    }
}