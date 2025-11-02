// Dados do jogo
const jogador = {
    nome: '',
    nivelAtual: 1,
    tempo: 0,
    dicasUsadas: 0,
    jogosCompletos: 0,
    melhorTempo: 0,
    nivelMaximo: 1,
    estatisticas: {
        facil: { completos: 0, melhorTempo: 0 },
        medio: { completos: 0, melhorTempo: 0 },
        dificil: { completos: 0, melhorTempo: 0 },
        expert: { completos: 0, melhorTempo: 0 }
    }
};

// Tabuleiro atual
let tabuleiro = [];
let solucao = [];
let celulasOriginais = [];
let celulaSelecionada = null;
let timerInterval = null;
let nivelAtual = 1;
const totalNiveis = 100;
let dificuldadeAtual = 'facil';

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    carregarDadosJogador();
    preencherSelectNiveis();
    aplicarTemaSalvo();
});

function inicializarEventos() {
    // Navegação entre seções
    document.getElementById('btnIniciarJogo').addEventListener('click', function() {
        const nome = document.getElementById('nomeJogador').value.trim();
        if (nome) {
            jogador.nome = nome;
            salvarDadosJogador();
            inicializarJogo();
        } else {
            alert('Por favor, digite seu nome!');
        }
    });

    document.getElementById('btnConfig').addEventListener('click', function() {
        mostrarSecao('secaoConfig');
    });

    document.getElementById('btnPersonalizar').addEventListener('click', function() {
        mostrarSecao('secaoPersonalizacao');
    });

    document.getElementById('btnEstatisticas').addEventListener('click', function() {
        atualizarEstatisticas();
        mostrarSecao('secaoEstatisticas');
    });

    document.getElementById('btnVoltarConfig').addEventListener('click', function() {
        mostrarSecao('secaoInicio');
    });

    document.getElementById('btnSalvarConfig').addEventListener('click', function() {
        salvarConfiguracoes();
        mostrarSecao('secaoInicio');
    });

    document.getElementById('btnAplicarPersonalizacao').addEventListener('click', function() {
        aplicarPersonalizacao();
        mostrarSecao('secaoInicio');
    });

    document.getElementById('btnVoltarEstat').addEventListener('click', function() {
        mostrarSecao('secaoInicio');
    });

    document.getElementById('btnNovoJogoEstat').addEventListener('click', function() {
        const nome = document.getElementById('nomeJogador').value.trim();
        if (nome) {
            jogador.nome = nome;
            salvarDadosJogador();
            inicializarJogo();
        } else {
            alert('Por favor, digite seu nome!');
        }
    });

    // Controles do jogo
    document.getElementById('btnVerificar').addEventListener('click', verificarJogo);
    document.getElementById('btnDica').addEventListener('click', darDica);
    document.getElementById('btnResolver').addEventListener('click', resolverJogo);
    document.getElementById('btnReiniciar').addEventListener('click', reiniciarJogo);
    document.getElementById('btnNovoJogo').addEventListener('click', function() {
        if (confirm('Deseja iniciar um novo jogo? O progresso atual será perdido.')) {
            mostrarSecao('secaoInicio');
        }
    });

    // Navegação pós-vitória
    document.getElementById('btnProximoNivel').addEventListener('click', function() {
        nivelAtual++;
        if (nivelAtual > totalNiveis) {
            nivelAtual = 1;
            alert('Parabéns! Você completou todos os níveis! Voltando ao nível 1.');
        }
        inicializarJogo();
    });

    document.getElementById('btnMenuPrincipalVitoria').addEventListener('click', function() {
        mostrarSecao('secaoInicio');
    });

    // Evento de teclado para entrada de números
    document.addEventListener('keydown', function(event) {
        if (document.getElementById('secaoJogo').style.display !== 'none') {
            const tecla = event.key;
            if (tecla >= '1' && tecla <= '9') {
                inserirNumero(parseInt(tecla));
            } else if (tecla === 'Backspace' || tecla === 'Delete' || tecla === '0') {
                apagarNumero();
            } else if (tecla === 'ArrowUp' || tecla === 'ArrowDown' || tecla === 'ArrowLeft' || tecla === 'ArrowRight') {
                moverSelecao(tecla);
            }
        }
    });

    // Alteração de dificuldade
    document.getElementById('selectDificuldade').addEventListener('change', function() {
        preencherSelectNiveis();
    });
}

function moverSelecao(direcao) {
    if (!celulaSelecionada) {
        selecionarCelula(0, 0);
        return;
    }

    let { row, col } = celulaSelecionada;

    switch(direcao) {
        case 'ArrowUp': row = Math.max(0, row - 1); break;
        case 'ArrowDown': row = Math.min(8, row + 1); break;
        case 'ArrowLeft': col = Math.max(0, col - 1); break;
        case 'ArrowRight': col = Math.min(8, col + 1); break;
    }

    selecionarCelula(row, col);
}

function carregarDadosJogador() {
    const dadosSalvos = localStorage.getItem('sudokuJogador');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        Object.assign(jogador, dados);
        document.getElementById('nomeJogador').value = jogador.nome;
    }
}

function salvarDadosJogador() {
    localStorage.setItem('sudokuJogador', JSON.stringify(jogador));
}

function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem('sudokuTema') || 'padrao';
    document.body.setAttribute('data-theme', temaSalvo);
    document.getElementById('selectTema').value = temaSalvo;
}

function preencherSelectNiveis() {
    const selectNivel = document.getElementById('selectNivel');
    selectNivel.innerHTML = '';
    
    for (let i = 1; i <= totalNiveis; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Nível ${i}`;
        selectNivel.appendChild(option);
    }
    
    // Selecionar o nível atual do jogador ou 1
    selectNivel.value = Math.min(jogador.nivelAtual, totalNiveis);
}

function salvarConfiguracoes() {
    const dificuldade = document.getElementById('selectDificuldade').value;
    const nivel = parseInt(document.getElementById('selectNivel').value);
    
    dificuldadeAtual = dificuldade;
    nivelAtual = nivel;
    jogador.nivelAtual = nivel;
    
    salvarDadosJogador();
}

function aplicarPersonalizacao() {
    const tema = document.getElementById('selectTema').value;
    document.body.setAttribute('data-theme', tema);
    localStorage.setItem('sudokuTema', tema);
}

function mostrarSecao(idSecao) {
    // Parar timer se estiver saindo da seção de jogo
    if (idSecao !== 'secaoJogo' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Esconder todas as seções
    const secoes = document.querySelectorAll('.secao-card');
    secoes.forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Mostrar a seção desejada
    document.getElementById(idSecao).style.display = 'block';
}

// Gerador de Sudoku
function gerarSudoku(dificuldade = 'facil') {
    // Inicializar tabuleiro vazio
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Preencher diagonal de blocos 3x3 (são independentes)
    for (let i = 0; i < 9; i += 3) {
        preencherBloco(board, i, i);
    }
    
    // Resolver o tabuleiro completo
    resolverSudoku(board);
    
    // Fazer uma cópia da solução
    const solution = board.map(row => [...row]);
    
    // Remover números baseado na dificuldade
    let celulasParaRemover;
    switch(dificuldade) {
        case 'facil': celulasParaRemover = 30; break;
        case 'medio': celulasParaRemover = 40; break;
        case 'dificil': celulasParaRemover = 50; break;
        case 'expert': celulasParaRemover = 55; break;
        default: celulasParaRemover = 40;
    }
    
    // Remover números aleatoriamente
    const posicoes = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            posicoes.push([i, j]);
        }
    }
    
    // Embaralhar posições
    for (let i = posicoes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [posicoes[i], posicoes[j]] = [posicoes[j], posicoes[i]];
    }
    
    // Remover células
    const originalCells = [];
    for (let i = 0; i < celulasParaRemover; i++) {
        const [row, col] = posicoes[i];
        originalCells.push({row, col, value: board[row][col]});
        board[row][col] = 0;
    }
    
    return { board, solution, originalCells };
}

function preencherBloco(board, row, col) {
    const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Embaralhar números
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    
    // Preencher o bloco 3x3
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = numeros.pop();
        }
    }
}

function resolverSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValido(board, row, col, num)) {
                        board[row][col] = num;
                        
                        if (resolverSudoku(board)) {
                            return true;
                        }
                        
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValido(board, row, col, num) {
    // Verificar linha
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    
    // Verificar coluna
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }
    
    // Verificar bloco 3x3
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    
    return true;
}

// Interface do usuário
function inicializarJogo() {
    // Obter configurações
    const dificuldade = document.getElementById('selectDificuldade').value;
    nivelAtual = parseInt(document.getElementById('selectNivel').value) || 1;
    
    // Gerar novo sudoku
    const { board, solution, originalCells } = gerarSudoku(dificuldade);
    tabuleiro = board;
    solucao = solution;
    celulasOriginais = originalCells;
    
    // Atualizar interface
    document.getElementById('nomeJogadorAtual').textContent = jogador.nome;
    document.getElementById('nivelAtual').textContent = nivelAtual;
    document.getElementById('totalNiveis').textContent = totalNiveis;
    
    // Atualizar badge de dificuldade
    const dificuldadeBadge = document.getElementById('dificuldadeAtual');
    dificuldadeBadge.textContent = dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1);
    dificuldadeBadge.className = 'dificuldade-badge';
    switch(dificuldade) {
        case 'facil': dificuldadeBadge.classList.add('dificuldade-facil'); break;
        case 'medio': dificuldadeBadge.classList.add('dificuldade-medio'); break;
        case 'dificil': dificuldadeBadge.classList.add('dificuldade-dificil'); break;
        case 'expert': dificuldadeBadge.classList.add('dificuldade-expert'); break;
    }
    
    // Renderizar tabuleiro
    renderizarTabuleiro();
    
    // Renderizar controles de números
    renderizarControlesNumeros();
    
    // Iniciar timer
    iniciarTimer();
    
    // Resetar dicas usadas para este jogo
    jogador.dicasUsadas = 0;
    
    // Mostrar seção de jogo
    mostrarSecao('secaoJogo');
}

function renderizarTabuleiro() {
    const tabuleiroElement = document.getElementById('tabuleiroSudoku');
    tabuleiroElement.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const celula = document.createElement('div');
            celula.className = 'celula-sudoku';
            celula.dataset.row = i;
            celula.dataset.col = j;
            
            // Verificar se é uma célula original (pré-preenchida)
            const isOriginal = celulasOriginais.some(c => c.row === i && c.col === j);
            
            if (tabuleiro[i][j] !== 0) {
                celula.textContent = tabuleiro[i][j];
                if (isOriginal) {
                    celula.classList.add('original');
                } else {
                    celula.classList.add('usuario');
                }
            }
            
            // Adicionar evento de clique
            celula.addEventListener('click', () => selecionarCelula(i, j));
            
            tabuleiroElement.appendChild(celula);
        }
    }
}

function renderizarControlesNumeros() {
    const controlesElement = document.querySelector('.numeros-jogo');
    controlesElement.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'numero-btn';
        btn.textContent = i;
        btn.addEventListener('click', () => inserirNumero(i));
        controlesElement.appendChild(btn);
    }
    
    // Adicionar botão para apagar
    const btnApagar = document.createElement('button');
    btnApagar.className = 'numero-btn';
    btnApagar.innerHTML = '<i class="fas fa-eraser"></i>';
    btnApagar.addEventListener('click', apagarNumero);
    controlesElement.appendChild(btnApagar);
}

function selecionarCelula(row, col) {
    // Desselecionar célula anterior
    if (celulaSelecionada) {
        const celulaAnterior = document.querySelector(`.celula-sudoku[data-row="${celulaSelecionada.row}"][data-col="${celulaSelecionada.col}"]`);
        if (celulaAnterior) {
            celulaAnterior.classList.remove('selecionada');
        }
    }
    
    // Verificar se é uma célula original (não pode ser editada)
    const isOriginal = celulasOriginais.some(c => c.row === row && c.col === col);
    if (isOriginal) {
        celulaSelecionada = null;
        return;
    }
    
    // Selecionar nova célula
    celulaSelecionada = { row, col };
    const celula = document.querySelector(`.celula-sudoku[data-row="${row}"][data-col="${col}"]`);
    celula.classList.add('selecionada');
}

function inserirNumero(num) {
    if (!celulaSelecionada) return;
    
    const { row, col } = celulaSelecionada;
    
    // Verificar se a célula pode ser editada
    const isOriginal = celulasOriginais.some(c => c.row === row && c.col === col);
    if (isOriginal) return;
    
    // Atualizar tabuleiro
    tabuleiro[row][col] = num;
    
    // Atualizar interface
    const celula = document.querySelector(`.celula-sudoku[data-row="${row}"][data-col="${col}"]`);
    celula.textContent = num;
    celula.classList.add('usuario');
    celula.classList.remove('dica');
    
    // Verificar se há erro
    if (num !== solucao[row][col]) {
        celula.classList.add('erro');
        mostrarMensagem('Número incorreto!', 'erro');
    } else {
        celula.classList.remove('erro');
        mostrarMensagem('', '');
        
        // Verificar se o jogo foi completado
        if (isJogoCompleto()) {
            completarJogo();
        }
    }
}

function apagarNumero() {
    if (!celulaSelecionada) return;
    
    const { row, col } = celulaSelecionada;
    
    // Verificar se a célula pode ser editada
    const isOriginal = celulasOriginais.some(c => c.row === row && c.col === col);
    if (isOriginal) return;
    
    // Atualizar tabuleiro
    tabuleiro[row][col] = 0;
    
    // Atualizar interface
    const celula = document.querySelector(`.celula-sudoku[data-row="${row}"][data-col="${col}"]`);
    celula.textContent = '';
    celula.classList.remove('usuario', 'erro', 'dica');
    mostrarMensagem('', '');
}

function isJogoCompleto() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (tabuleiro[i][j] !== solucao[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function completarJogo() {
    // Parar timer
    clearInterval(timerInterval);
    
    // Atualizar estatísticas do jogador
    jogador.jogosCompletos++;
    jogador.nivelMaximo = Math.max(jogador.nivelMaximo, nivelAtual);
    jogador.nivelAtual = Math.min(nivelAtual + 1, totalNiveis);
    
    // Atualizar estatísticas por dificuldade
    if (!jogador.estatisticas[dificuldadeAtual].melhorTempo || jogador.tempo < jogador.estatisticas[dificuldadeAtual].melhorTempo) {
        jogador.estatisticas[dificuldadeAtual].melhorTempo = jogador.tempo;
    }
    jogador.estatisticas[dificuldadeAtual].completos++;
    
    // Verificar se é o melhor tempo geral
    if (jogador.melhorTempo === 0 || jogador.tempo < jogador.melhorTempo) {
        jogador.melhorTempo = jogador.tempo;
    }
    
    // Salvar dados
    salvarDadosJogador();
    
    // Atualizar interface de vitória
    document.getElementById('nivelCompletado').textContent = nivelAtual;
    document.getElementById('tempoCompletado').textContent = formatarTempo(jogador.tempo);
    document.getElementById('dicasUsadasCompletado').textContent = jogador.dicasUsadas;
    
    // Mostrar seção de vitória
    mostrarSecao('secaoVitoria');
}

function verificarJogo() {
    let temErros = false;
    let celulasVazias = 0;
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const celula = document.querySelector(`.celula-sudoku[data-row="${i}"][data-col="${j}"]`);
            
            if (tabuleiro[i][j] === 0) {
                celulasVazias++;
            } else if (tabuleiro[i][j] !== solucao[i][j]) {
                celula.classList.add('erro');
                temErros = true;
            } else {
                celula.classList.remove('erro');
            }
        }
    }
    
    if (temErros) {
        mostrarMensagem('Há erros no tabuleiro!', 'erro');
    } else if (celulasVazias > 0) {
        mostrarMensagem('Tabuleiro correto até agora! Restam ' + celulasVazias + ' células.', 'sucesso');
    } else {
        mostrarMensagem('Parabéns! Tabuleiro completo e correto!', 'sucesso');
        completarJogo();
    }
}

function darDica() {
    if (!celulaSelecionada) {
        mostrarMensagem('Selecione uma célula para receber uma dica!', 'erro');
        return;
    }
    
    const { row, col } = celulaSelecionada;
    
    // Verificar se a célula já está preenchida corretamente
    if (tabuleiro[row][col] === solucao[row][col]) {
        mostrarMensagem('Esta célula já está correta!', 'erro');
        return;
    }
    
    // Preencher a célula com a solução
    tabuleiro[row][col] = solucao[row][col];
    
    // Atualizar interface
    const celula = document.querySelector(`.celula-sudoku[data-row="${row}"][data-col="${col}"]`);
    celula.textContent = solucao[row][col];
    celula.classList.add('dica');
    celula.classList.remove('erro');
    
    // Atualizar contador de dicas
    jogador.dicasUsadas++;
    
    // Verificar se o jogo foi completado
    if (isJogoCompleto()) {
        completarJogo();
    }
}

function resolverJogo() {
    if (confirm('Tem certeza que deseja resolver o jogo automaticamente?')) {
        // Preencher todo o tabuleiro com a solução
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                tabuleiro[i][j] = solucao[i][j];
            }
        }
        
        // Atualizar interface
        renderizarTabuleiro();
        
        // Completar o jogo
        completarJogo();
    }
}

function reiniciarJogo() {
    if (confirm('Tem certeza que deseja reiniciar o jogo?')) {
        // Restaurar tabuleiro original
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                tabuleiro[i][j] = 0;
            }
        }
        
        // Preencher células originais
        celulasOriginais.forEach(c => {
            tabuleiro[c.row][c.col] = c.value;
        });
        
        // Atualizar interface
        renderizarTabuleiro();
        
        // Resetar timer
        jogador.tempo = 0;
        document.getElementById('tempoJogo').textContent = '00:00';
        
        // Resetar mensagens
        mostrarMensagem('', '');
        
        // Resetar dicas usadas para este jogo
        jogador.dicasUsadas = 0;
    }
}

function iniciarTimer() {
    // Parar timer anterior, se existir
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Resetar tempo
    jogador.tempo = 0;
    document.getElementById('tempoJogo').textContent = '00:00';
    
    // Iniciar novo timer
    timerInterval = setInterval(() => {
        jogador.tempo++;
        document.getElementById('tempoJogo').textContent = formatarTempo(jogador.tempo);
    }, 1000);
}

function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
}

function mostrarMensagem(mensagem, tipo) {
    const elemento = document.getElementById('mensagemJogo');
    elemento.textContent = mensagem;
    elemento.className = 'mensagem-status';
    
    if (tipo === 'sucesso') {
        elemento.classList.add('mensagem-sucesso');
    } else if (tipo === 'erro') {
        elemento.classList.add('mensagem-erro');
    }
}

function atualizarEstatisticas() {
    document.getElementById('estatJogosCompletos').textContent = jogador.jogosCompletos;
    document.getElementById('estatMelhorTempo').textContent = formatarTempo(jogador.melhorTempo);
    document.getElementById('estatNivelMaximo').textContent = jogador.nivelMaximo;
    document.getElementById('estatDicasUsadas').textContent = jogador.dicasUsadas;
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/JogodaForca/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registrado com sucesso: ', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha ao registrar ServiceWorker: ', error);
            });
    });
}

// Detectar se o app está sendo executado como PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Inicializar verificação PWA
if (isRunningAsPWA()) {
    console.log('Executando como PWA');
    document.body.classList.add('pwa-mode');
}
