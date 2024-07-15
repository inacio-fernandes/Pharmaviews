from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# TROCAR USUARIO E SENHA
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://USUARIO:SENHA@localhost/gestao_verbas'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# criacao das classes do bd
class TipoAcao(db.Model):
    __tablename__ = 'tipo_acao'
    codigo_acao = db.Column(db.Integer, primary_key=True)
    nome_acao = db.Column(db.String(100), nullable=False)

class Acao(db.Model):
    __tablename__ = 'acao'
    id = db.Column(db.Integer, primary_key=True)
    codigo_acao = db.Column(db.Integer, db.ForeignKey('tipo_acao.codigo_acao'), nullable=False)
    investimento = db.Column(db.Float, nullable=False)
    data_prevista = db.Column(db.Date, nullable=False)
    data_cadastro = db.Column(db.Date, default=datetime.utcnow)

    tipo_acao = db.relationship('TipoAcao', backref=db.backref('acoes', lazy=True))

with app.app_context():
    db.create_all()


@app.route('/acoes', methods=['GET'])
def get_acoes():
    try:
        acoes = Acao.query.all()
        result = []
        for acao in acoes:
            acao_data = {
                'id': acao.id,
                'tipo_acao': acao.tipo_acao.nome_acao,
                'data_prevista': acao.data_prevista.strftime('%Y-%m-%d'),
                'investimento': acao.investimento,
                'data_cadastro': acao.data_cadastro.strftime('%Y-%m-%d')
            }
            result.append(acao_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'message': 'Erro ao carregar ações', 'error': str(e)}), 500


@app.route('/acoes/<int:id>', methods=['GET'])
def get_acao(id):
    try:
        acao = Acao.query.get(id)
        acao_data = {
            'id': acao.id,
            'tipo_acao': acao.tipo_acao.nome_acao,
            'data_prevista': acao.data_prevista.strftime('%Y-%m-%d'),
            'investimento': acao.investimento,
            'data_cadastro': acao.data_cadastro.strftime('%Y-%m-%d')
        }
        return jsonify(acao_data)
    except Exception as e:
        return jsonify({'message': 'Erro ao carregar ação', 'error': str(e)}), 500


@app.route('/acoes', methods=['POST'])
def add_acao():
    data = request.get_json()
    nome_acao = data['nome_acao']

    tipo_acao = TipoAcao.query.filter_by(nome_acao=nome_acao).first()
    if not tipo_acao:
        return jsonify({'message': 'Tipo de ação não encontrado.'}), 404

    nova_acao = Acao(
        codigo_acao=tipo_acao.codigo_acao,
        investimento=data['investimento'],
        data_prevista=datetime.strptime(data['data_prevista'], '%Y-%m-%d')
    )
    db.session.add(nova_acao)
    db.session.commit()
    return jsonify({'message': 'Ação adicionada com sucesso!'})


@app.route('/acoes/<int:id>', methods=['PUT'])
def update_acao(id):
    try:
        data = request.get_json()
        acao = Acao.query.get(id)

        if not acao:
            return jsonify({'message': 'Ação não encontrada.'}), 404

        nome_acao = data['nome_acao']
        tipo_acao = TipoAcao.query.filter_by(nome_acao=nome_acao).first()
        print(tipo_acao)
        if not tipo_acao:
            return jsonify({'message': 'Tipo de ação não encontrado.'}), 404

        acao.codigo_acao = tipo_acao.codigo_acao
        acao.investimento = data['investimento']
        acao.data_prevista = datetime.strptime(data['data_prevista'], '%Y-%m-%d')
        db.session.commit()

        return jsonify({'message': 'Ação atualizada com sucesso!'})
    except Exception as e:
        print("Erro:", e)
        return jsonify({'message': 'Erro ao atualizar ação', 'error': str(e)}), 500


@app.route('/acoes/<int:id>', methods=['DELETE'])
def delete_acao(id):
    try:
        acao = Acao.query.get(id)
        if not acao:
            return jsonify({'message': 'Ação não encontrada.'}), 404
        db.session.delete(acao)
        db.session.commit()
        return jsonify({'message': 'Ação excluída com sucesso!'})
    except Exception as e:
        return jsonify({'message': 'Erro ao excluir ação', 'error': str(e)}), 500



@app.route('/status', methods=['GET'])
def status():
    return jsonify({'message': 'a conexao esta ok!'})


if __name__ == '__main__':
    app.run(debug=True)
