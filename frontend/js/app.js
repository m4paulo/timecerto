// frontend/js/app.js

const API_BASE_URL = 'http://127.0.0.1:5000'; 

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const formAtleta = document.getElementById('formAtleta');
    const listaAtletas = document.getElementById('listaAtletas');
    const btnAtletas = document.getElementById('btnAtletas');
    const btnSessoes = document.getElementById('btnSessoes');
    const sectionAtletas = document.getElementById('sectionAtletas');
    const sectionSessoes = document.getElementById('sectionSessoes');

    const formSessao = document.getElementById('formSessao');
    const listaSessoes = document.getElementById('listaSessoes');
    
    // Elementos para controle da UX/UI da seção de Sessões
    const sessoesListagemArea = document.getElementById('sessoesListagemArea'); 
    const gerenciarDetalhesArea = document.getElementById('gerenciarDetalhesArea'); 

    const sessaoTituloSpan = document.getElementById('sessaoTitulo');
    const btnVoltarSessoes = document.getElementById('btnVoltarSessoes');
    const statusSessaoSelect = document.getElementById('statusSessaoSelect'); 
    const selectAtletaParaSessao = document.getElementById('selectAtletaParaSessao');
    const addParticipanteBtn = document.getElementById('addParticipanteBtn');
    const listaParticipantesSessao = document.getElementById('listaParticipantesSessao');

    const btnIniciarScout = document.getElementById('btnIniciarScout');
    const areaScout = document.getElementById('areaScout');
    const controlesScoutDiv = document.getElementById('controlesScout');
    const btnFinalizarScout = document.getElementById('btnFinalizarScout');

    const btnFinancas = document.getElementById('btnFinancas'); 
    const sectionFinancas = document.getElementById('sectionFinancas'); 
    const formRegistrarPagamento = document.getElementById('formRegistrarPagamento'); 
    const selectAtletaPagamento = document.getElementById('selectAtletaPagamento'); 
    const listaPagamentos = document.getElementById('listaPagamentos'); 
    const listaPendencias = document.getElementById('listaPendencias'); 
    const referenciaMesAnoInput = document.getElementById('referenciaMesAno'); 

    const btnHistorico = document.getElementById('btnHistorico'); 
    const sectionHistorico = document.getElementById('sectionHistorico'); 
    const listaHistoricoPeladas = document.getElementById('listaHistoricoPeladas'); 

    // NOVAS REFERÊNCIAS PARA EDIÇÃO DE ATLETAS
    const cadastroAtletaArea = document.getElementById('cadastroAtletaArea');
    const edicaoAtletaArea = document.getElementById('edicaoAtletaArea');
    const editarAtletaNomeSpan = document.getElementById('editarAtletaNome');
    const btnVoltarAtletas = document.getElementById('btnVoltarAtletas');
    const formEditarAtleta = document.getElementById('formEditarAtleta');
    const editarAtletaIdInput = document.getElementById('editarAtletaId');
    const editarNomeAtletaInput = document.getElementById('editarNomeAtleta');
    const editarPosicaoPrincipalAtletaSelect = document.getElementById('editarPosicaoPrincipalAtleta');
    const editarPosicaoSecundariaAtletaSelect = document.getElementById('editarPosicaoSecundariaAtleta');
    const editarTipoAtletaSelect = document.getElementById('editarTipoAtleta');
    const editarNivelAtletaSelect = document.getElementById('editarNivelAtleta');
    const editarVelocidadeInput = document.getElementById('editarVelocidade');
    const editarFisicoInput = document.getElementById('editarFisico');
    const editarArremessoInput = document.getElementById('editarArremesso');
    const editarDefesaInput = document.getElementById('editarDefesa');
    const editarDribleInput = document.getElementById('editarDrible');

    // NOVAS REFERÊNCIAS PARA FORMAÇÃO DE TIMES
    const btnFormarTimes = document.getElementById('btnFormarTimes');
    const areaTimes = document.getElementById('areaTimes');
    const timesGeradosDiv = document.getElementById('timesGerados');
    const btnSalvarTimes = document.getElementById('btnSalvarTimes'); 
    const btnLimparTimes = document.getElementById('btnLimparTimes'); 


    let currentSessaoId = null; 
    let allAtletas = []; 
    let currentParticipantes = []; 
    let scoutData = {};

    // --- Funções para Navegação entre Seções ---
    function showSection(sectionToShow, buttonToActivate) {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden');
        });
        document.querySelectorAll('nav button').forEach(button => {
            button.classList.remove('active-nav');
        });

        sectionToShow.classList.remove('hidden');
        buttonToActivate.classList.add('active-nav');
    }

    btnAtletas.addEventListener('click', () => {
        showSection(sectionAtletas, btnAtletas);
        carregarAtletas();
        // Garante que a área de edição esteja escondida ao voltar para a lista de atletas
        edicaoAtletaArea.classList.add('hidden');
        cadastroAtletaArea.classList.remove('hidden');
    });

    btnSessoes.addEventListener('click', () => {
        showSection(sectionSessoes, btnSessoes);
        carregarSessoes('ativa'); 
        // Garante que a área de detalhes esteja escondida ao voltar para a lista de sessões
        gerenciarDetalhesArea.classList.add('hidden'); 
        // Garante que a listagem principal esteja visível (correção de UX/UI)
        sessoesListagemArea.classList.remove('hidden'); 
    });

    btnFinancas.addEventListener('click', () => {
        showSection(sectionFinancas, btnFinancas);
        carregarAtletasParaSelectPagamento();
        carregarPagamentos();
        carregarPendencias();
    });
    
    btnHistorico.addEventListener('click', () => { 
        showSection(sectionHistorico, btnHistorico);
        carregarHistoricoPeladas();
    });

    // --- Lógica para Gerenciar Atletas ---

    async function carregarAtletas() {
        try {
            const response = await fetch(`${API_BASE_URL}/atletas`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const atletas = await response.json();
            listaAtletas.innerHTML = ''; 

            if (atletas.length === 0) {
                listaAtletas.innerHTML = '<li>Nenhum atleta cadastrado ainda.</li>';
            } else {
                atletas.forEach(atleta => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${atleta.nome} - ${atleta.posicao_principal} (${atleta.tipo}, Nível: ${atleta.nivel})
                        <br><small>V:${atleta.velocidade} F:${atleta.fisico} A:${atleta.arremesso} D:${atleta.defesa} Dr:${atleta.drible}</small></span>
                        <div class="button-group">
                            <button data-id="${atleta.id}" class="action-button edit-atleta">✏️</button>
                            <button data-id="${atleta.id}" class="action-button delete-atleta">🗑️</button>
                        </div>
                    `;
                    listaAtletas.appendChild(li);
                });
                document.querySelectorAll('.delete-atleta').forEach(button => {
                    button.addEventListener('click', (e) => {
                        deletarAtleta(e.target.dataset.id);
                    });
                });
                document.querySelectorAll('.edit-atleta').forEach(button => {
                    button.addEventListener('click', (e) => {
                        abrirEdicaoAtleta(e.target.dataset.id);
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar atletas:', error);
            alert(`Não foi possível carregar os atletas. Erro: ${error.message}. Verifique se o backend Flask está rodando e acessível.`);
        }
    }

    formAtleta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nomeAtleta').value;
        const posicao_principal = document.getElementById('posicaoPrincipalAtleta').value;
        const posicao_secundaria = document.getElementById('posicaoSecundariaAtleta').value;
        const tipo = document.getElementById('tipoAtleta').value;
        const nivel = document.getElementById('nivelAtleta').value;

        // Novos atributos padrão ao criar
        const velocidade = 1; 
        const fisico = 1;
        const arremesso = 1;
        const defesa = 1;
        const drible = 1;


        const novoAtleta = {
            nome,
            posicao_principal,
            posicao_secundaria: posicao_secundaria || null,
            tipo,
            nivel,
            velocidade,
            fisico,
            arremesso,
            defesa,
            drible
        };

        try {
            const response = await fetch(`${API_BASE_URL}/atletas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoAtleta)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao adicionar atleta: ${response.status} - ${errorData.error || response.statusText}`);
            }

            alert('Atleta adicionado com sucesso!');
            formAtleta.reset();
            carregarAtletas();
        } catch (error) {
            console.error('Erro ao adicionar atleta:', error);
            alert(`Erro ao adicionar atleta: ${error.message}`);
        }
    });

    async function deletarAtleta(id) {
        if (!confirm('Tem certeza que deseja deletar este atleta? Isso removerá todas as participações e pagamentos relacionados.')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/atletas/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao deletar atleta: ${response.status} - ${errorData.error || response.statusText}`);
            }
            alert('Atleta deletado com sucesso!');
            carregarAtletas();
            carregarPagamentos(); 
            carregarPendencias(); 
        } catch (error) {
            console.error('Erro ao deletar atleta:', error);
            alert(`Erro ao deletar atleta: ${error.message}`);
        }
    }

    // --- Lógica para Edição de Atletas ---
    async function abrirEdicaoAtleta(id) {
        cadastroAtletaArea.classList.add('hidden');
        edicaoAtletaArea.classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/atletas`); 
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const atletas = await response.json();
            const atleta = atletas.find(a => a.id == id);

            if (atleta) {
                editarAtletaIdInput.value = atleta.id;
                editarAtletaNomeSpan.textContent = atleta.nome;
                editarNomeAtletaInput.value = atleta.nome;
                editarPosicaoPrincipalAtletaSelect.value = atleta.posicao_principal;
                editarPosicaoSecundariaAtletaSelect.value = atleta.posicao_secundaria || ''; 
                editarTipoAtletaSelect.value = atleta.tipo;
                editarNivelAtletaSelect.value = atleta.nivel;
                editarVelocidadeInput.value = atleta.velocidade;
                editarFisicoInput.value = atleta.fisico;
                editarArremessoInput.value = atleta.arremesso;
                editarDefesaInput.value = atleta.defesa;
                editarDribleInput.value = atleta.drible;
            } else {
                alert('Atleta não encontrado para edição.');
                btnVoltarAtletas.click(); 
            }
        } catch (error) {
            console.error('Erro ao carregar dados do atleta para edição:', error);
            alert(`Não foi possível carregar os dados do atleta para edição. Erro: ${error.message}.`);
        }
    }

    btnVoltarAtletas.addEventListener('click', () => {
        edicaoAtletaArea.classList.add('hidden');
        cadastroAtletaArea.classList.remove('hidden');
        carregarAtletas();
    });

    formEditarAtleta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = editarAtletaIdInput.value;
        const nome = editarNomeAtletaInput.value;
        const posicao_principal = editarPosicaoPrincipalAtletaSelect.value;
        const posicao_secundaria = editarPosicaoSecundariaAtletaSelect.value;
        const tipo = editarTipoAtletaSelect.value;
        const nivel = editarNivelAtletaSelect.value;
        const velocidade = parseInt(editarVelocidadeInput.value);
        const fisico = parseInt(editarFisicoInput.value);
        const arremesso = parseInt(editarArremessoInput.value);
        const defesa = parseInt(editarDefesaInput.value);
        const drible = parseInt(editarDribleInput.value);

        const atletaAtualizado = {
            nome,
            posicao_principal,
            posicao_secundaria: posicao_secundaria || null,
            tipo,
            nivel,
            velocidade,
            fisico,
            arremesso,
            defesa,
            drible
        };

        try {
            const response = await fetch(`${API_BASE_URL}/atletas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atletaAtualizado)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao atualizar atleta: ${response.status} - ${errorData.error || response.statusText}`);
            }

            alert('Atleta atualizado com sucesso!');
            btnVoltarAtletas.click(); 
        } catch (error) {
            console.error('Erro ao atualizar atleta:', error);
            alert(`Erro ao atualizar atleta: ${error.message}`);
        }
    });

    // --- Funções Auxiliares de Status da Sessão ---
    async function updateSessaoStatus(sessaoId, newStatus) {
        try {
            const response = await fetch(`${API_BASE_URL}/sessoes/${sessaoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao atualizar status: ${response.status} - ${errorData.error || response.statusText}`);
            }
            console.log(`Status da sessão ${sessaoId} atualizado para ${newStatus}.`);
        } catch (error) {
            console.error('Erro ao atualizar status da sessão (updateSessaoStatus):', error);
            alert(`Erro ao atualizar status da sessão automaticamente: ${error.message}. Verifique o console.`);
        }
    }

    // --- Lógica para Gerenciar Sessões ---

    async function carregarSessoes(statusFilter = 'ativa') { 
        try {
            const response = await fetch(`${API_BASE_URL}/sessoes`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const sessoes = await response.json();
            listaSessoes.innerHTML = '';

            const sessoesFiltradas = sessoes.filter(s => s.status === statusFilter);

            if (sessoesFiltradas.length === 0) {
                listaSessoes.innerHTML = `<li>Nenhuma sessão ${statusFilter === 'ativa' ? 'ativa' : statusFilter} criada ainda.</li>`;
            } else {
                sessoesFiltradas.forEach(sessao => {
                    const li = document.createElement('li');
                    const dataHora = new Date(sessao.data_hora).toLocaleString('pt-BR');
                    li.innerHTML = `
                        <span>${dataHora} - ${sessao.local} (${sessao.max_jogadores || 'N/A'} jogadores)</span>
                        <div class="button-group">
                            <button data-sessao-id="${sessao.id}" class="btn-gerenciar green-button">Gerenciar</button>
                            <button data-sessao-id="${sessao.id}" class="action-button delete-sessao">🗑️</button>
                        </div>
                    `;
                    listaSessoes.appendChild(li);
                });

                document.querySelectorAll('.btn-gerenciar').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const sessaoId = e.target.dataset.sessaoId;
                        currentSessaoId = sessaoId;
                        const sessaoInfo = sessoes.find(s => s.id == sessaoId);
                        sessaoTituloSpan.textContent = `${new Date(sessaoInfo.data_hora).toLocaleString('pt-BR')} - ${sessaoInfo.local}`;
                        statusSessaoSelect.value = sessaoInfo.status; 
                        showGerenciarParticipantes(sessaoId);
                    });
                });
                document.querySelectorAll('.delete-sessao').forEach(button => {
                    button.addEventListener('click', (e) => {
                        deletarSessao(e.target.dataset.sessaoId);
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar sessões:', error);
            alert(`Não foi possível carregar as sessões. Erro: ${error.message}.`);
        }
    }

    formSessao.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data_hora = document.getElementById('dataHoraSessao').value;
        const local = document.getElementById('localSessao').value;
        const max_jogadores = document.getElementById('maxJogadoresSessao').value;

        const novaSessao = {
            data_hora: data_hora, 
            local,
            max_jogadores: max_jogadores ? parseInt(max_jogadores) : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/sessoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaSessao)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao criar sessão: ${response.status} - ${errorData.error}`);
            }

            alert('Sessão criada com sucesso!');
            formSessao.reset();
            carregarSessoes('ativa');
        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            alert(`Erro ao criar sessão: ${error.message}`);
        }
    });

    async function deletarSessao(id) {
        if (!confirm('Tem certeza que deseja deletar esta sessão? Isso removerá participantes e estatísticas.')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/sessoes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                    throw new Error(`Erro ao deletar sessão: ${response.status} - ${errorData.error || response.statusText}`);
                }
                alert('Sessão deletada com sucesso!');
                carregarSessoes('ativa'); 
                carregarHistoricoPeladas(); 
            } catch (error) {
                console.error('Erro ao deletar sessão:', error);
                alert(`Erro ao deletar sessão: ${error.message}`);
            }
        }

        // Event Listener para o select de status da sessão
    statusSessaoSelect.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        if (!currentSessaoId) {
            alert('Nenhuma sessão selecionada para alterar o status.');
            return;
        }
        if (!confirm(`Tem certeza que deseja alterar o status da sessão para "${newStatus}"?`)) {
            statusSessaoSelect.value = statusSessaoSelect.dataset.originalStatus; 
            return;
        }

        try {
            await updateSessaoStatus(currentSessaoId, newStatus); 
            alert(`Status da sessão atualizado para "${newStatus}"!`);
            showSection(sectionSessoes, btnSessoes); 
            carregarSessoes('ativa');
            carregarHistoricoPeladas(); 
        } catch (error) {
            console.error('Erro ao atualizar status da sessão (EventListener):', error);
            alert(`Erro ao atualizar status da sessão: ${error.message}`);
            statusSessaoSelect.value = statusSessaoSelect.dataset.originalStatus;
        }
    });


    // --- Lógica para Gerenciamento de Participantes em uma Sessão Específica ---

    async function showGerenciarParticipantes(sessaoId) {
        sessoesListagemArea.classList.add('hidden'); 
        gerenciarDetalhesArea.classList.remove('hidden'); 

        const sessaoInfoResponse = await fetch(`${API_BASE_URL}/sessoes`); 
        const sessoes = await sessaoInfoResponse.json();
        const currentSessaoData = sessoes.find(s => s.id == sessaoId);
        if (currentSessaoData) {
            statusSessaoSelect.dataset.originalStatus = currentSessaoData.status; 
        }

        await carregarAtletasParaSelect();
        await carregarParticipantesSessao(sessaoId);

        scoutData = {};
        areaScout.classList.add('hidden');
        btnIniciarScout.style.display = 'block';
        controlesScoutDiv.innerHTML = '';
        areaTimes.classList.add('hidden'); 
    }

    btnVoltarSessoes.addEventListener('click', () => {
        gerenciarDetalhesArea.classList.add('hidden');
        sessoesListagemArea.classList.remove('hidden');
        carregarSessoes('ativa'); 
    });

    async function carregarAtletasParaSelect() {
        try {
            const response = await fetch(`${API_BASE_URL}/atletas`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const atletas = await response.json();
            selectAtletaParaSessao.innerHTML = '<option value="">Selecione um Atleta</option>';
            allAtletas.forEach(atleta => {
                const option = document.createElement('option');
                option.value = atleta.id;
                option.textContent = `${atleta.nome} (${atleta.tipo}, Nível: ${atleta.nivel})`;
                selectAtletaParaSessao.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar atletas para select:', error);
            alert('Não foi possível carregar a lista de atletas para adicionar. Verifique sua conexão com o backend.');
        }
    }

    addParticipanteBtn.addEventListener('click', async () => {
        const atletaId = selectAtletaParaSessao.value;
        if (!atletaId || !currentSessaoId) {
            alert('Por favor, selecione um atleta e certifique-se de que uma sessão está ativa.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/sessoes/${currentSessaoId}/participantes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_atleta: atletaId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao adicionar participante: ${response.status} - ${errorData.error || response.statusText}`);
            }

            alert('Participante adicionado à sessão com sucesso!');
            selectAtletaParaSessao.value = '';
            carregarParticipantesSessao(currentSessaoId);
        } catch (error) {
            console.error('Erro ao adicionar participante:', error);
            alert(`Erro ao adicionar participante: ${error.message}`);
        }
    });

    async function carregarParticipantesSessao(sessaoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/sessoes/${sessaoId}/participantes`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const participantes = await response.json();
            currentParticipantes = participantes; 
            listaParticipantesSessao.innerHTML = ''; 

            if (participantes.length === 0) {
                listaParticipantesSessao.innerHTML = '<li>Nenhum participante adicionado a esta sessão ainda.</li>';
            } else {
                participantes.forEach(p => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${p.atleta.nome} (${p.atleta.tipo}, Nível: ${p.atleta.nivel}) - ${p.presente ? 'Presente ✅' : 'Aguardando'}</span>
                        <div class="button-group">
                            ${p.presente ? '' : `<button data-participacao-id="${p.participacao_id}" class="btn-marcar-presenca green-button">Marcar Presença</button>`}
                            <button data-participacao-id="${p.participacao_id}" class="action-button delete-participacao">🗑️</button>
                        </div>
                    `;
                    listaParticipantesSessao.appendChild(li);
                });
                
                document.querySelectorAll('.btn-marcar-presenca').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const participacaoId = e.target.dataset.participacaoId;
                        await marcarPresenca(participacaoId);
                    });
                });
                document.querySelectorAll('.delete-participacao').forEach(button => {
                    button.addEventListener('click', (e) => {
                        deletarParticipacao(e.target.dataset.participacaoId);
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar participantes da sessão:', error);
            alert(`Não foi possível carregar os participantes da sessão. Erro: ${error.message}.`);
        }
    }

    async function marcarPresenca(participacaoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/participacoes/${participacaoId}/marcar_presenca`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao marcar presença: ${response.status} - ${errorData.error || response.statusText}`);
            }

            alert('Presença marcada com sucesso!');
            carregarParticipantesSessao(currentSessaoId); 
        } catch (error) {
            console.error('Erro ao marcar presença:', error);
            alert(`Erro ao marcar presença: ${error.message}`);
        }
    }

    async function deletarParticipacao(id) {
        if (!confirm('Tem certeza que deseja remover este participante da sessão?')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/participacoes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao remover participante: ${response.status} - ${errorData.error || response.statusText}`);
                }
                alert('Participante removido com sucesso!');
                carregarParticipantesSessao(currentSessaoId);
            } catch (error) {
                console.error('Erro ao remover participante:', error);
                alert(`Erro ao remover participante: ${error.message}`);
            }
        }

        // --- Lógica para Scout do Jogo ---

    btnIniciarScout.addEventListener('click', () => {
        const presentes = currentParticipantes.filter(p => p.presente);
        if (presentes.length === 0) {
            alert('Não há jogadores presentes para iniciar o scout. Marque a presença primeiro.');
            return;
        }

        btnIniciarScout.style.display = 'none';
        areaScout.classList.remove('hidden');
        controlesScoutDiv.innerHTML = '';

        presentes.forEach(p => {
            scoutData[p.participacao_id] = { pontos: 0, assistencias: 0, faltas: 0 };

            const playerControls = document.createElement('div');
            playerControls.classList.add('scout-player-controls');
            playerControls.innerHTML = `
                <span>${p.atleta.nome}:</span>
                <button class="scout-button" data-type="pontos" data-participacao-id="${p.participacao_id}" data-value="1">+1</button>
                <button class="scout-button" data-type="pontos" data-participacao-id="${p.participacao_id}" data-value="2">+2</button>
                <button class="scout-button" data-type="pontos" data-participacao-id="${p.participacao_id}" data-value="3">+3</button>
                <button class="scout-button foul" data-type="faltas" data-participacao-id="${p.participacao_id}" data-value="1">+1 Falta</button>
                <button class="scout-button" data-type="assistencias" data-participacao-id="${p.participacao_id}" data-value="1">+1 Assist</button>
                <button class="scout-button minus" data-type="pontos" data-participacao-id="${p.participacao_id}" data-value="-1">-1 Ponto</button>
                <span id="stats-${p.participacao_id}">P:0 A:0 F:0</span>
            `;
            controlesScoutDiv.appendChild(playerControls);
        });

        document.querySelectorAll('.scout-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const participacaoId = e.target.dataset.participacaoId;
                const type = e.target.dataset.type;
                const value = parseInt(e.target.dataset.value);

                if (scoutData[participacaoId]) {
                    if (type === 'pontos') scoutData[participacaoId].pontos += value;
                    if (type === 'assistencias') scoutData[participacaoId].assistencias += value;
                    if (type === 'faltas') scoutData[participacaoId].faltas += value;
                    
                    if (scoutData[participacaoId].pontos < 0) scoutData[participacaoId].pontos = 0;
                    if (scoutData[participacaoId].assistencias < 0) scoutData[participacaoId].assistencias = 0;
                    if (scoutData[participacaoId].faltas < 0) scoutData[participacaoId].faltas = 0;

                    updateScoutDisplay(participacaoId);
                }
            });
        });
    });

    function updateScoutDisplay(participacaoId) {
        const statsSpan = document.getElementById(`stats-${participacaoId}`);
        if (statsSpan && scoutData[participacaoId]) {
            const { pontos, assistencias, faltas } = scoutData[participacaoId];
            statsSpan.textContent = `P:${pontos} A:${assistencias} F:${faltas}`;
        }
    }

    btnFinalizarScout.addEventListener('click', async () => {
        if (!currentSessaoId) {
            alert('Nenhuma sessão selecionada.');
            return;
        }

        const confirmacao = confirm('Tem certeza que deseja finalizar e salvar o scout para esta sessão?');
        if (!confirmacao) {
            return;
        }

        try {
            for (const participacaoId in scoutData) {
                if (scoutData.hasOwnProperty(participacaoId)) {
                    const stats = scoutData[participacaoId];
                    const response = await fetch(`${API_BASE_URL}/estatisticas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_participacao: parseInt(participacaoId),
                            pontos: stats.pontos,
                            assistencias: stats.assistencias,
                            faltas: stats.faltas
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Falha ao salvar estatísticas para participação ${participacaoId}: ${errorData.error}`);
                    }
                }
            }
            alert('Scout salvo com sucesso!');
            areaScout.classList.add('hidden');
            btnIniciarScout.style.display = 'block';
            scoutData = {};
            await updateSessaoStatus(currentSessaoId, 'finalizada'); 
        } catch (error) {
            console.error('Erro ao finalizar scout:', error);
            alert(`Erro ao finalizar scout: ${error.message}. Verifique o console.`);
        }
    });

    // --- Lógica para Formação de Times ---

    btnFormarTimes.addEventListener('click', async () => {
        if (!currentSessaoId) {
            alert('Selecione uma sessão para formar times.');
            return;
        }

        const presentes = currentParticipantes.filter(p => p.presente);
        if (presentes.length < 2) { 
            alert('Mínimo de 2 jogadores presentes para formar times.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/sessoes/${currentSessaoId}/formar_times`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao formar times: ${response.status} - ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            currentTimes = data.times; 
            exibirTimes(currentTimes);
            areaTimes.classList.remove('hidden'); 
        } catch (error) {
            console.error('Erro ao formar times:', error); 
            alert(`Erro ao formar times: ${error.message}`);
        }
    });

    function exibirTimes(times) {
        timesGeradosDiv.innerHTML = '';
        if (times && times.length > 0) {
            times.forEach(time => {
                const teamDiv = document.createElement('div');
                teamDiv.style.border = '1px solid #ddd';
                teamDiv.style.padding = '10px';
                teamDiv.style.marginBottom = '10px';
                teamDiv.style.borderRadius = '5px';
                teamDiv.innerHTML = `<h4>Time ${time.time_numero}</h4>`;
                time.jogadores.forEach(jogador => {
                    teamDiv.innerHTML += `<p>- ${jogador.nome} (Nível: ${jogador.nivel}, V:${jogador.velocidade} F:${jogador.fisico} A:${jogador.arremesso} D:${jogador.defesa} Dr:${jogador.drible})</p>`;
                });
                timesGeradosDiv.appendChild(teamDiv);
            });
        } else {
            timesGeradosDiv.innerHTML = '<p>Nenhum time formado.</p>';
        }
    }

    btnSalvarTimes.addEventListener('click', () => {
        alert('Funcionalidade "Salvar Times" a ser implementada. Isso pode envolver salvar a composição do time para a sessão.');
    });

    btnLimparTimes.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar os times gerados?')) {
            timesGeradosDiv.innerHTML = '';
            areaTimes.classList.add('hidden');
            currentTimes = [];
            alert('Times limpos.');
        }
    });

    // --- Lógica para Gestão Financeira (Pagamentos) ---

    async function carregarAtletasParaSelectPagamento() {
        try {
            const response = await fetch(`${API_BASE_URL}/atletas`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const atletas = await response.json(); 
            selectAtletaPagamento.innerHTML = '<option value="">Selecione um Atleta</option>';
            atletas.forEach(atleta => { 
                const option = document.createElement('option');
                option.value = atleta.id;
                option.textContent = `${atleta.nome} (${atleta.tipo})`;
                selectAtletaPagamento.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar atletas para select de pagamento:', error);
            alert('Não foi possível carregar a lista de atletas para registrar pagamentos.');
        }
    }

    document.getElementById('tipoPagamento').addEventListener('change', (e) => {
        if (e.target.value === 'mensalidade') {
            referenciaMesAnoInput.disabled = false;
            referenciaMesAnoInput.required = true;
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear();
            referenciaMesAnoInput.value = `${year}-${month}`;
        } else {
            referenciaMesAnoInput.disabled = true;
            referenciaMesAnoInput.required = false;
            referenciaMesAnoInput.value = '';
        }
    });
    document.getElementById('tipoPagamento').dispatchEvent(new Event('change'));


    formRegistrarPagamento.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id_atleta = selectAtletaPagamento.value;
        const valor = document.getElementById('valorPagamento').value;
        const tipo_pagamento = document.getElementById('tipoPagamento').value;
        const referencia_mes_ano = document.getElementById('referenciaMesAno').value;

        const novoPagamento = {
            id_atleta: parseInt(id_atleta),
            valor: parseFloat(valor),
            tipo_pagamento,
            referencia_mes_ano: tipo_pagamento === 'mensalidade' ? referencia_mes_ano : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoPagamento)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao registrar pagamento: ${response.status} - ${errorData.error}`);
            }

            alert('Pagamento registrado com sucesso!');
            formRegistrarPagamento.reset();
            document.getElementById('tipoPagamento').dispatchEvent(new Event('change'));
            carregarPagamentos();
            carregarPendencias();
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            alert(`Erro ao registrar pagamento: ${error.message}`);
        }
    });

    async function carregarPagamentos() {
        try {
            const response = await fetch(`${API_BASE_URL}/pagamentos`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const pagamentos = await response.json();
            listaPagamentos.innerHTML = '';

            if (pagamentos.length === 0) {
                listaPagamentos.innerHTML = '<li>Nenhum pagamento registrado ainda.</li>';
            } else {
                pagamentos.forEach(pag => {
                    const li = document.createElement('li');
                    const dataPagamento = new Date(pag.data_pagamento).toLocaleString('pt-BR');
                    li.innerHTML = `
                        <span>${pag.atleta_nome} - R$ ${pag.valor.toFixed(2)} - ${pag.tipo_pagamento} 
                        ${pag.referencia_mes_ano ? `(${pag.referencia_mes_ano})` : ''} em ${dataPagamento}</span>
                        <div class="button-group">
                            <button data-id="${pag.id}" class="action-button delete-pagamento">🗑️</button>
                        </div>
                    `;
                    listaPagamentos.appendChild(li);
                });
                document.querySelectorAll('.delete-pagamento').forEach(button => {
                    button.addEventListener('click', (e) => {
                        deletarPagamento(e.target.dataset.id);
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
            alert(`Não foi possível carregar o histórico de pagamentos. Erro: ${error.message}.`);
        }
    }

    async function deletarPagamento(id) {
        if (!confirm('Tem certeza que deseja deletar este pagamento?')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao deletar pagamento: ${response.status} - ${errorData.error || response.statusText}`);
            }
            alert('Pagamento deletado com sucesso!');
            carregarPagamentos();
            carregarPendencias();
        } catch (error) {
            console.error('Erro ao deletar pagamento:', error);
            alert(`Erro ao deletar pagamento: ${error.message}`);
        }
    }

    async function carregarPendencias() {
        try {
            const response = await fetch(`${API_BASE_URL}/pagamentos/pendencias`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const pendencias = await response.json();
            listaPendencias.innerHTML = '';

            if (pendencias.length === 0) {
                listaPendencias.innerHTML = '<li>Nenhuma pendência de mensalidade para o mês atual.</li>';
            } else {
                pendencias.forEach(p => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${p.nome} - Mês de Ref.: ${p.mes_referencia}</span>
                    `;
                    listaPendencias.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar pendências:', error);
            alert(`Não foi possível carregar as pendências de mensalidade. Erro: ${error.message}.`);
        }
    }

    // --- Lógica para Histórico de Peladas ---
    async function carregarHistoricoPeladas() {
        try {
            const response = await fetch(`${API_BASE_URL}/historico_peladas`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const historico = await response.json();
            listaHistoricoPeladas.innerHTML = '';

            if (historico.length === 0) {
                listaHistoricoPeladas.innerHTML = '<li>Nenhum histórico de pelada ainda.</li>';
            } else {
                historico.forEach(sessao => {
                    const li = document.createElement('li');
                    const dataHora = new Date(sessao.data_hora).toLocaleString('pt-BR');
                    li.innerHTML = `
                        <span>${dataHora} - ${sessao.local} [${sessao.status ? sessao.status.toUpperCase() : 'N/A'}]</span>
                        <br>
                        <small>P: ${sessao.total_pontos} | A: ${sessao.total_assistencias} | F: ${sessao.total_faltas}</small>
                    `;
                    listaHistoricoPeladas.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de peladas:', error);
            alert(`Não foi possível carregar o histórico de peladas. Erro: ${error.message}.`);
        }
    }

    // --- Inicialização do Aplicativo ---
    carregarAtletas(); 
    showSection(sectionAtletas, btnAtletas);
});