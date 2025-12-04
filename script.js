// Configuração: API URL (deixe vazio para usar apenas localStorage)
// Para usar com backend, defina a URL da sua API aqui
// Exemplo: const API_URL = https://lista-presentes-evacloudd.vercel.app/api;
const API_URL = https://lista-presentes-evacloudd.vercel.app/api;

// Chave para localStorage
const STORAGE_KEY = 'evacloudd_gifts';

// Detectar se estamos em produção (GitHub Pages) ou desenvolvimento
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const USE_LOCALSTORAGE_ONLY = !API_URL || isProduction;

// Carregar presentes ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadGifts();
    
    // Configurar formulário
    const form = document.getElementById('giftForm');
    form.addEventListener('submit', handleFormSubmit);
});

// ==================== FUNÇÕES DE ARMAZENAMENTO ====================

// Obter todos os presentes do localStorage
function getGiftsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return [];
    }
}

// Salvar presentes no localStorage
function saveGiftsToStorage(gifts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

// Adicionar presente ao localStorage
function addGiftToStorage(gift) {
    const gifts = getGiftsFromStorage();
    const newGift = {
        id: Date.now(), // Usar timestamp como ID
        nome: gift.nome,
        presente: gift.presente,
        link: gift.link,
        created_at: new Date().toISOString()
    };
    gifts.unshift(newGift); // Adicionar no início
    saveGiftsToStorage(gifts);
    return newGift;
}

// ==================== FUNÇÕES DE API ====================

// Tentar carregar da API, com fallback para localStorage
async function loadGiftsFromAPI() {
    if (!API_URL) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/gifts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('API não disponível, usando localStorage:', error);
    }
    
    return null;
}

// Tentar adicionar via API, com fallback para localStorage
async function addGiftViaAPI(giftData) {
    if (!API_URL) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/gifts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(giftData)
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('API não disponível, usando localStorage:', error);
    }
    
    return null;
}

// ==================== FUNÇÕES PRINCIPAIS ====================

// Função para carregar todos os presentes
async function loadGifts() {
    const loading = document.getElementById('loading');
    const giftsList = document.getElementById('giftsList');
    const emptyState = document.getElementById('emptyState');

    try {
        loading.style.display = 'block';
        giftsList.innerHTML = '';
        emptyState.style.display = 'none';

        let gifts = [];

        // Tentar carregar da API primeiro, se disponível
        if (!USE_LOCALSTORAGE_ONLY) {
            const apiGifts = await loadGiftsFromAPI();
            if (apiGifts) {
                gifts = apiGifts;
                // Sincronizar com localStorage como backup
                saveGiftsToStorage(gifts);
            } else {
                // Se API falhar, usar localStorage
                gifts = getGiftsFromStorage();
            }
        } else {
            // Usar apenas localStorage
            gifts = getGiftsFromStorage();
        }

        loading.style.display = 'none';

        if (gifts.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        // Ordenar por data mais recente primeiro
        gifts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        gifts.forEach(gift => {
            const giftCard = createGiftCard(gift);
            giftsList.appendChild(giftCard);
        });

    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        loading.style.display = 'none';
        
        // Tentar carregar do localStorage como fallback
        try {
            const localGifts = getGiftsFromStorage();
            if (localGifts.length > 0) {
                localGifts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                localGifts.forEach(gift => {
                    const giftCard = createGiftCard(gift);
                    giftsList.appendChild(giftCard);
                });
                return;
            }
        } catch (e) {
            console.error('Erro ao carregar do localStorage:', e);
        }
        
        giftsList.innerHTML = '<p class="error-message">Erro ao carregar presentes. Tente recarregar a página.</p>';
        showNotification('Erro ao carregar presentes', 'error');
    }
}

// Função para criar um card de presente
function createGiftCard(gift) {
    const card = document.createElement('div');
    card.className = 'gift-card';

    const date = new Date(gift.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    card.innerHTML = `
        <div class="gift-card-header">
            <div>
                <div class="gift-name">${escapeHtml(gift.presente)}</div>
                <div class="sugested-by">Sugerido por: ${escapeHtml(gift.nome)}</div>
                <div class="sugested-by" style="margin-top: 5px; font-size: 0.75rem;">${date}</div>
            </div>
        </div>
        <a href="${escapeHtml(gift.link)}" target="_blank" rel="noopener noreferrer" class="gift-link">
            Ver Presente →
        </a>
    `;

    return card;
}

// Função para lidar com o envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        nome: document.getElementById('nome').value.trim(),
        presente: document.getElementById('presente').value.trim(),
        link: document.getElementById('link').value.trim()
    };

    // Validação
    if (!formData.nome || !formData.presente || !formData.link) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }

    // Validar URL
    try {
        new URL(formData.link);
    } catch (e) {
        showNotification('Por favor, forneça uma URL válida', 'error');
        return;
    }

    try {
        let result;

        // Tentar adicionar via API primeiro, se disponível
        if (!USE_LOCALSTORAGE_ONLY) {
            result = await addGiftViaAPI(formData);
        }

        // Se API não funcionou ou não está disponível, usar localStorage
        if (!result) {
            result = addGiftToStorage(formData);
        } else {
            // Se foi adicionado via API, também salvar no localStorage como backup
            const gifts = getGiftsFromStorage();
            gifts.unshift(result);
            saveGiftsToStorage(gifts);
        }
        
        // Limpar formulário
        document.getElementById('giftForm').reset();
        
        // Mostrar notificação de sucesso
        showNotification('Presente adicionado com sucesso! 🎉');
        
        // Recarregar lista de presentes
        setTimeout(() => {
            loadGifts();
        }, 500);

    } catch (error) {
        console.error('Erro ao adicionar presente:', error);
        showNotification(error.message || 'Erro ao adicionar presente', 'error');
    }
}

// Função para mostrar notificações
function showNotification(message, type = 'success') {
    // Remover notificação existente se houver
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Função para escapar HTML e prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exportar dados (funcionalidade extra para backup)
function exportGifts() {
    const gifts = getGiftsFromStorage();
    const dataStr = JSON.stringify(gifts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentes-evacloudd.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Importar dados (funcionalidade extra para restaurar backup)
function importGifts(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const gifts = JSON.parse(e.target.result);
            if (Array.isArray(gifts)) {
                saveGiftsToStorage(gifts);
                showNotification('Presentes importados com sucesso!');
                loadGifts();
            } else {
                showNotification('Arquivo inválido', 'error');
            }
        } catch (error) {
            showNotification('Erro ao importar arquivo', 'error');
        }
    };
    reader.readAsText(file);
}