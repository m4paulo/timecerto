# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app) # Habilita CORS para permitir requisições do frontend

# Configuração do Banco de Dados PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("Variável de ambiente DATABASE_URL não configurada. Crie um arquivo .env na pasta backend.")

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

# --- Rotas da API ---

@app.route('/')
def home():
    return "Bem-vindo à API do TimeCerto! Conectado e pronto para a pelada!"

@app.route('/test_db')
def test_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT 1;')
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({"message": f"Conexão com o banco de dados bem-sucedida! Resultado: {result}"}), 200
    except Exception as e:
        print(f"Erro na conexão com o banco de dados (test_db): {e}")
        return jsonify({"error": f"Erro na conexão com o banco de dados: {str(e)}"}), 500

# --- Rotas para Gerenciar Atletas ---

@app.route('/atletas', methods=['POST'])
def criar_atleta():
    data = request.json
    nome = data.get('nome')
    posicao_principal = data.get('posicao_principal')
    posicao_secundaria = data.get('posicao_secundaria')
    tipo = data.get('tipo')
    nivel = data.get('nivel') # Nível geral (A, B, C)

    # NOVOS CAMPOS: Atributos detalhados
    velocidade = data.get('velocidade', 1) # Default 1 se não fornecido
    fisico = data.get('fisico', 1)
    arremesso = data.get('arremesso', 1)
    defesa = data.get('defesa', 1)
    drible = data.get('drible', 1)

    if not all([nome, posicao_principal, tipo, nivel]):
        return jsonify({"error": "Dados incompletos para o atleta. Nome, Posição Principal, Tipo e Nível são obrigatórios."}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO atletas (nome, posicao_principal, posicao_secundaria, tipo, nivel, velocidade, fisico, arremesso, defesa, drible)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
            """,
            (nome, posicao_principal, posicao_secundaria, tipo, nivel, velocidade, fisico, arremesso, defesa, drible)
        )
        atleta_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Atleta criado com sucesso!", "id": atleta_id}), 201
    except Exception as e:
        print(f"Erro ao criar atleta: {e}")
        return jsonify({"error": f"Erro ao criar atleta: {str(e)}"}), 500

@app.route('/api/atletas', methods=['GET'])
def listar_atletas():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, nome, posicao_principal, posicao_secundaria, tipo, nivel, velocidade, fisico, arremesso, defesa, drible FROM atletas ORDER BY nome;")
        atletas = cur.fetchall()
        cur.close()
        conn.close()

        atletas_list = []
        for atleta in atletas:
            atletas_list.append({
                "id": atleta[0],
                "nome": atleta[1],
                "posicao_principal": atleta[2],
                "posicao_secundaria": atleta[3],
                "tipo": atleta[4],
                "nivel": atleta[5],
                "velocidade": atleta[6], 
                "fisico": atleta[7],     
                "arremesso": atleta[8],  
                "defesa": atleta[9],     
                "drible": atleta[10]     
            })
        return jsonify(atletas_list), 200
    except Exception as e:
        print(f"Erro ao listar atletas: {e}")
        return jsonify({"error": f"Erro ao listar atletas: {str(e)}"}), 500

@app.route('/atletas/<int:atleta_id>', methods=['PUT'])
def editar_atleta(atleta_id):
    data = request.json
    nome = data.get('nome')
    posicao_principal = data.get('posicao_principal')
    posicao_secundaria = data.get('posicao_secundaria')
    tipo = data.get('tipo')
    nivel = data.get('nivel')
    velocidade = data.get('velocidade')
    fisico = data.get('fisico')
    arremesso = data.get('arremesso')
    defesa = data.get('defesa')
    drible = data.get('drible')

    if not all([nome, posicao_principal, tipo, nivel, velocidade, fisico, arremesso, defesa, drible]):
        return jsonify({"error": "Todos os campos do atleta são obrigatórios para edição."}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE atletas SET
                nome = %s,
                posicao_principal = %s,
                posicao_secundaria = %s,
                tipo = %s,
                nivel = %s,
                velocidade = %s,
                fisico = %s,
                arremesso = %s,
                defesa = %s,
                drible = %s
            WHERE id = %s;
            """,
            (nome, posicao_principal, posicao_secundaria, tipo, nivel,
             velocidade, fisico, arremesso, defesa, drible, atleta_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Atleta não encontrado."}), 404
        return jsonify({"message": "Atleta atualizado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao editar atleta: {e}")
        return jsonify({"error": f"Erro ao editar atleta: {str(e)}"}), 500

@app.route('/atletas/<int:atleta_id>', methods=['DELETE'])
def deletar_atleta(atleta_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM atletas WHERE id = %s;", (atleta_id,))
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Atleta não encontrado."}), 404
        return jsonify({"message": "Atleta deletado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao deletar atleta: {e}")
        return jsonify({"error": f"Erro ao deletar atleta: {str(e)}"}), 500


# --- Rotas para Gerenciar Sessões ---

@app.route('/sessoes', methods=['POST'])
def criar_sessao():
    data = request.json
    data_hora_str = data.get('data_hora')
    local = data.get('local')
    max_jogadores = data.get('max_jogadores')

    if not all([data_hora_str, local]):
        return jsonify({"error": "Data/Hora e Local são obrigatórios para a sessão."}), 400

    try:
        data_hora_obj = datetime.strptime(data_hora_str, '%Y-%m-%dT%H:%M')

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO sessoes (data_hora, local, max_jogadores)
            VALUES (%s, %s, %s) RETURNING id;
            """,
            (data_hora_obj, local, max_jogadores)
        )
        sessao_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Sessão criada com sucesso!", "id": sessao_id}), 201
    except ValueError:
        return jsonify({"error": "Formato de data/hora inválido. Use AAAA-MM-DDTHH:MM (ex: 2025-06-20T18:00)"}), 400
    except Exception as e:
        print(f"Erro ao criar sessão: {e}")
        return jsonify({"error": f"Erro ao criar sessão: {str(e)}"}), 500

@app.route('/sessoes', methods=['GET'])
def listar_sessoes():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, data_hora, local, max_jogadores, ativa, status FROM sessoes ORDER BY data_hora DESC;")
        sessoes = cur.fetchall()
        cur.close()
        conn.close()

        sessoes_list = []
        for sessao in sessoes:
            sessoes_list.append({
                "id": sessao[0],
                "data_hora": sessao[1].isoformat(),
                "local": sessao[2],
                "max_jogadores": sessao[3],
                "ativa": sessao[4],
                "status": sessao[5]
            })
        return jsonify(sessoes_list), 200
    except Exception as e:
        print(f"Erro ao listar sessões: {e}")
        return jsonify({"error": f"Erro ao listar sessões: {str(e)}"}), 500

@app.route('/sessoes/<int:sessao_id>', methods=['DELETE'])
def deletar_sessao(sessao_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM sessoes WHERE id = %s;", (sessao_id,))
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Sessão não encontrada."}), 404
        return jsonify({"message": "Sessão deletada com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao deletar sessão: {e}")
        return jsonify({"error": f"Erro ao deletar sessão: {str(e)}"}), 500

@app.route('/sessoes/<int:sessao_id>/status', methods=['PUT'])
def atualizar_status_sessao(sessao_id):
    data = request.json
    status = data.get('status') # 'finalizada', 'cancelada', 'ativa'

    if not status or status not in ['finalizada', 'cancelada', 'ativa']:
        return jsonify({"error": "Status inválido."}), 400

    # Lógica para garantir que 'ativa' é false para finalizada/cancelada
    ativa_status = True if status == 'ativa' else False

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE sessoes SET status = %s, ativa = %s WHERE id = %s;",
            (status, ativa_status, sessao_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Sessão não encontrada."}), 404
        return jsonify({"message": f"Status da sessão atualizado para {status}!"}), 200
    except Exception as e:
        print(f"Erro ao atualizar status da sessão: {e}")
        return jsonify({"error": f"Erro ao atualizar status da sessão: {str(e)}"}), 500


# --- Rotas para Participações ---

@app.route('/sessoes/<int:sessao_id>/participantes', methods=['POST'])
def adicionar_participante_sessao(sessao_id):
    data = request.json
    id_atleta = data.get('id_atleta')

    if not id_atleta:
        return jsonify({"error": "ID do atleta é obrigatório."}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM participacoes WHERE id_sessao = %s AND id_atleta = %s;",
            (sessao_id, id_atleta)
        )
        if cur.fetchone():
            return jsonify({"error": "Atleta já está participando desta sessão."}), 409 # Conflict

        cur.execute(
            """
            INSERT INTO participacoes (id_sessao, id_atleta)
            VALUES (%s, %s) RETURNING id;
            """,
            (sessao_id, id_atleta)
        )
        participacao_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Participante adicionado à sessão com sucesso!", "id": participacao_id}), 201
    except Exception as e:
        print(f"Erro ao adicionar participante: {e}")
        return jsonify({"error": f"Erro ao adicionar participante à sessão: {str(e)}"}), 500

@app.route('/sessoes/<int:sessao_id>/participantes', methods=['GET'])
def listar_participantes_sessao(sessao_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT p.id, a.id, a.nome, a.posicao_principal, a.tipo, a.nivel, p.presente
            FROM participacoes p
            JOIN atletas a ON p.id_atleta = a.id
            WHERE p.id_sessao = %s
            ORDER BY a.nome;
            """,
            (sessao_id,)
        )
        participantes = cur.fetchall()
        cur.close()
        conn.close()

        participantes_list = []
        for p in participantes:
            participantes_list.append({
                "participacao_id": p[0],
                "atleta": {
                    "id": p[1],
                    "nome": p[2],
                    "posicao_principal": p[3],
                    "tipo": p[4],
                    "nivel": p[5]
                },
                "presente": p[6]
            })
        return jsonify(participantes_list), 200
    except Exception as e:
        print(f"Erro ao listar participantes: {e}")
        return jsonify({"error": f"Erro ao listar participantes da sessão: {str(e)}"}), 500

@app.route('/participacoes/<int:participacao_id>', methods=['DELETE'])
def deletar_participacao(participacao_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM participacoes WHERE id = %s;", (participacao_id,))
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Participação não encontrada."}), 404
        return jsonify({"message": "Participação deletada com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao deletar participação: {e}")
        return jsonify({"error": f"Erro ao deletar participação: {str(e)}"}), 500


@app.route('/participacoes/<int:participacao_id>/marcar_presenca', methods=['PUT'])
def marcar_presenca(participacao_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE participacoes SET presente = TRUE WHERE id = %s;",
            (participacao_id,)
        )
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Participação não encontrada."}), 404
        return jsonify({"message": "Presença marcada com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao marcar presença: {e}")
        return jsonify({"error": f"Erro ao marcar presença: {str(e)}"}), 500

# --- Rotas para Estatísticas do Jogo ---

@app.route('/estatisticas', methods=['POST'])
def criar_ou_atualizar_estatistica():
    data = request.json
    id_participacao = data.get('id_participacao')
    pontos = data.get('pontos', 0)
    assistencias = data.get('assistencias', 0)
    faltas = data.get('faltas', 0)

    if not id_participacao:
        return jsonify({"error": "ID da participação é obrigatório."}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, pontos, assistencias, faltas FROM estatisticas_partida WHERE id_participacao = %s;",
            (id_participacao,)
        )
        estatistica_existente = cur.fetchone()

        if estatistica_existente:
            est_id, old_pontos, old_assistencias, old_faltas = estatistica_existente
            new_pontos = old_pontos + pontos
            new_assistencias = old_assistencias + assistencias
            new_faltas = old_faltas + faltas

            cur.execute(
                """
                UPDATE estatisticas_partida
                SET pontos = %s, assistencias = %s, faltas = %s
                WHERE id = %s;
                """,
                (new_pontos, new_assistencias, new_faltas, est_id)
            )
            message = "Estatísticas atualizadas com sucesso!"
            estatistica_id = est_id
        else:
            cur.execute(
                """
                INSERT INTO estatisticas_partida (id_participacao, pontos, assistencias, faltas)
                VALUES (%s, %s, %s, %s) RETURNING id;
                """,
                (id_participacao, pontos, assistencias, faltas)
            )
            estatistica_id = cur.fetchone()[0]
            message = "Estatística criada com sucesso!"

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": message, "id": estatistica_id}), 201 if not estatistica_existente else 200
    except Exception as e:
        print(f"Erro ao criar/atualizar estatística: {e}")
        return jsonify({"error": f"Erro ao criar/atualizar estatística: {str(e)}"}), 500

@app.route('/estatisticas/<int:id_participacao>', methods=['GET'])
def obter_estatisticas(id_participacao):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT pontos, assistencias, faltas FROM estatisticas_partida WHERE id_participacao = %s;",
            (id_participacao,)
        )
        estatisticas = cur.fetchone()
        cur.close()
        conn.close()

        if estatisticas:
            return jsonify({
                "pontos": estatisticas[0],
                "assistencias": estatisticas[1],
                "faltas": estatisticas[2]
            }), 200
        else:
            return jsonify({"pontos": 0, "assistencias": 0, "faltas": 0}), 200
    except Exception as e:
        print(f"Erro ao obter estatísticas: {e}")
        return jsonify({"error": f"Erro ao obter estatísticas: {str(e)}"}), 500


# --- Rotas para Formação de Times ---

@app.route('/sessoes/<int:sessao_id>/formar_times', methods=['GET'])
def formar_times(sessao_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT p.id_atleta, a.nome, a.nivel, a.posicao_principal, a.posicao_secundaria,
                   a.velocidade, a.fisico, a.arremesso, a.defesa, a.drible, p.presente
            FROM participacoes p
            JOIN atletas a ON p.id_atleta = a.id
            WHERE p.id_sessao = %s AND p.presente = TRUE
            ORDER BY a.nivel, a.posicao_principal;
            """,
            (sessao_id,)
        )
        jogadores_presentes_raw = cur.fetchall()
        cur.close()
        conn.close()

        if not jogadores_presentes_raw:
            return jsonify({"error": "Nenhum jogador presente nesta sessão para formar times."}), 400

        jogadores_presentes = []
        for j in jogadores_presentes_raw:
            jogadores_presentes.append({
                "id_atleta": j[0],
                "nome": j[1],
                "nivel": j[2],
                "posicao_principal": j[3],
                "posicao_secundaria": j[4],
                "velocidade": j[5], 
                "fisico": j[6],     
                "arremesso": j[7],  
                "defesa": j[8],     
                "drible": j[9]      
            })

        for jogador in jogadores_presentes:
            jogador['score_habilidade'] = sum([
                jogador['velocidade'], jogador['fisico'], jogador['arremesso'],
                jogador['defesa'], jogador['drible']
            ])

        jogadores_presentes.sort(key=lambda x: (x['nivel'], -x['score_habilidade']), reverse=True) 

        times = [[], []] 
        num_jogadores = len(jogadores_presentes)
        num_times = 2 

        if num_jogadores < num_times:
            return jsonify({"error": f"Mínimo de {num_times} jogadores para formar {num_times} times."}), 400

        for i, jogador in enumerate(jogadores_presentes):
            if (i // num_times) % 2 == 0: 
                time_idx = i % num_times
            else: 
                time_idx = num_times - 1 - (i % num_times)
            times[time_idx].append(jogador)

        times_formatados = []
        for idx, time in enumerate(times):
            times_formatados.append({
                "time_numero": idx + 1,
                "jogadores": time
            })

        return jsonify({"message": "Times formados com sucesso!", "times": times_formatados}), 200
    except Exception as e:
        print(f"Erro ao formar times: {e}")
        return jsonify({"error": f"Erro ao formar times: {str(e)}"}), 500

# --- Rotas para Gestão Financeira (Pagamentos) ---

@app.route('/pagamentos', methods=['POST'])
def registrar_pagamento():
    data = request.json
    id_atleta = data.get('id_atleta')
    valor = data.get('valor')
    tipo_pagamento = data.get('tipo_pagamento') # 'mensalidade' ou 'diaria'
    referencia_mes_ano = data.get('referencia_mes_ano') # Opcional, para mensalidades

    if not all([id_atleta, valor, tipo_pagamento]):
        return jsonify({"error": "ID do atleta, valor e tipo de pagamento são obrigatórios."}), 400

    try:
        valor_decimal = float(valor)

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO pagamentos (id_atleta, valor, tipo_pagamento, referencia_mes_ano)
            VALUES (%s, %s, %s, %s) RETURNING id;
            """,
            (id_atleta, valor_decimal, tipo_pagamento, referencia_mes_ano)
        )
        pagamento_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Pagamento registrado com sucesso!", "id": pagamento_id}), 201
    except ValueError:
        return jsonify({"error": "Valor inválido para o pagamento."}), 400
    except Exception as e:
        print(f"Erro ao registrar pagamento: {e}")
        return jsonify({"error": f"Erro ao registrar pagamento: {str(e)}"}), 500

@app.route('/pagamentos', methods=['GET'])
def listar_pagamentos():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT p.id, a.nome, p.valor, p.tipo_pagamento, p.referencia_mes_ano, p.data_pagamento
            FROM pagamentos p
            JOIN atletas a ON p.id_atleta = a.id
            ORDER BY p.data_pagamento DESC;
            """
        )
        pagamentos = cur.fetchall()
        cur.close()
        conn.close()

        pagamentos_list = []
        for pag in pagamentos:
            pagamentos_list.append({
                "id": pag[0],
                "atleta_nome": pag[1],
                "valor": float(pag[2]),
                "tipo_pagamento": pag[3],
                "referencia_mes_ano": pag[4],
                "data_pagamento": pag[5].isoformat()
            })
        return jsonify(pagamentos_list), 200
    except Exception as e:
        print(f"Erro ao listar pagamentos: {e}")
        return jsonify({"error": f"Erro ao listar pagamentos: {str(e)}"}), 500

@app.route('/pagamentos/pendencias', methods=['GET'])
def listar_pendencias():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        mes_ano_atual = datetime.now().strftime('%Y-%m')

        cur.execute("SELECT id, nome FROM atletas WHERE tipo = 'mensalista';")
        todos_mensalistas = cur.fetchall()

        pendencias_list = []
        for atleta_id, atleta_nome in todos_mensalistas:
            cur.execute(
                "SELECT id FROM pagamentos WHERE id_atleta = %s AND tipo_pagamento = 'mensalidade' AND referencia_mes_ano = %s;",
                (atleta_id, mes_ano_atual)
            )
            if not cur.fetchone():
                pendencias_list.append({
                    "id_atleta": atleta_id,
                    "nome": atleta_nome,
                    "mes_referencia": mes_ano_atual
                })

        cur.close()
        conn.close()
        return jsonify(pendencias_list), 200
    except Exception as e:
        print(f"Erro ao listar pendências: {e}")
        return jsonify({"error": f"Erro ao listar pendências: {str(e)}"}), 500

@app.route('/pagamentos/<int:pagamento_id>', methods=['DELETE'])
def deletar_pagamento(pagamento_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM pagamentos WHERE id = %s;", (pagamento_id,))
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            return jsonify({"error": "Pagamento não encontrado."}), 404
        return jsonify({"message": "Pagamento deletado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao deletar pagamento: {e}")
        return jsonify({"error": f"Erro ao deletar pagamento: {str(e)}"}), 500


# --- Rotas para o Histórico de Peladas (Sessões Finalizadas) ---
@app.route('/historico_peladas', methods=['GET'])
def listar_historico_peladas():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 
                s.id, s.data_hora, s.local, s.max_jogadores, s.status,
                COALESCE(SUM(ep.pontos), 0) as total_pontos,
                COALESCE(SUM(ep.assistencias), 0) as total_assistencias,
                COALESCE(SUM(ep.faltas), 0) as total_faltas
            FROM sessoes s
            LEFT JOIN participacoes p ON s.id = p.id_sessao
            LEFT JOIN estatisticas_partida ep ON p.id = ep.id_participacao
            WHERE s.status = 'finalizada' OR s.status = 'cancelada'
            GROUP BY s.id, s.data_hora, s.local, s.max_jogadores, s.status
            ORDER BY s.data_hora DESC;
            """
        )
        historico = cur.fetchall()
        cur.close()
        conn.close()

        historico_list = []
        for item in historico:
            historico_list.append({
                "id": item[0],
                "data_hora": item[1].isoformat(),
                "local": item[2],
                "max_jogadores": item[3],
                "status": item[4],
                "total_pontos": int(item[5]) if item[5] is not None else 0,
                "total_assistencias": int(item[6]) if item[6] is not None else 0,
                "total_faltas": int(item[7]) if item[7] is not None else 0,
            })
        return jsonify(historico_list), 200
    except Exception as e:
        print(f"Erro ao listar histórico de peladas: {e}")
        return jsonify({"error": f"Erro ao listar histórico de peladas: {str(e)}"}), 500


# --- Execução do App ---

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) # Adicione host='0.0.0.0'