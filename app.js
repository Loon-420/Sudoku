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

    // Evento de teclado global para entrada de números
    document.addEventListener('keydown', function(event) {
        if (document.getElementById('secaoJogo').style.display !== 'none' && celulaSelecionada) {
            const tecla = event.key;
            const { row, col } = celulaSelecionada;
            
            // Verificar se é uma célula original (não pode ser editada)
            const isOriginal = celulasOriginais.some(c => c.row === row && c.col === col);
            if (isOriginal) {
                if (tecla >= '1' && tecla <= '9') {
                    event.preventDefault();
                    mostrarMensagem('Não pode alterar números originais!', 'erro');
                }
                return;
            }
            
            // Teclas numéricas (1-9)
            if (tecla >= '1' && tecla <= '9') {
                event.preventDefault();
                inserirNumero(parseInt(tecla), row, col);
            }
            
            // Teclas de apagar
            else if (tecla === 'Backspace' || tecla === 'Delete' || tecla === '0') {
                event.preventDefault();
                apagarNumero(row, col);
            }
            
            // Navegação com setas
            else if (tecla === 'ArrowUp' || tecla === 'ArrowDown' || tecla === 'ArrowLeft' || tecla === 'ArrowRight') {
                event.preventDefault();
                moverComSetas(tecla, row, col);
            }
        }
    });

    // Alteração de dificuldade
    document.getElementById('selectDificuldade').addEventListener('change', function() {
        preencherSelectNiveis();
    });
}

function moverComSetas(direcao, currentRow, currentCol) {
    let newRow = currentRow;
    let newCol = currentCol;
    
    switch(direcao) {
        case 'ArrowUp': newRow = Math.max(0, currentRow - 1); break;
        case 'ArrowDown': newRow = Math.min(8, currentRow + 1); break;
        case 'ArrowLeft': newCol = Math.max(0, currentCol - 1); break;
        case 'ArrowRight': newCol = Math.min(8, currentCol + 1); break;
    }
    
    // Só mover se for para uma célula diferente
    if (newRow !== currentRow || newCol !== currentCol) {
        focarCelula(newRow, newCol);
    }
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

function preencher
