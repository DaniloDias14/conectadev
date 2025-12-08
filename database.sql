-- Tabelas do ConectaDev
-- Supabase PostgreSQL

-- Tabela de usuários
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('admin', 'contratante', 'proponente')),
  foto_perfil VARCHAR(500),
  bio TEXT,
  telefone VARCHAR(20),
  verificado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de desafios
CREATE TABLE desafios (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  requisitos TEXT,
  linguagens TEXT,
  orcamento DECIMAL(10, 2) NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'concluido', 'deletado')),
  vencedor_proposta_id BIGINT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Tabela de propostas
CREATE TABLE propostas (
  id BIGSERIAL PRIMARY KEY,
  desafio_id BIGINT NOT NULL REFERENCES desafios(id) ON DELETE CASCADE,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  justificativa TEXT NOT NULL,
  prazo_estimado INTEGER NOT NULL,
  versao INTEGER DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(desafio_id, usuario_id)
);

-- Tabela de comentários
CREATE TABLE comentarios (
  id BIGSERIAL PRIMARY KEY,
  desafio_id BIGINT NOT NULL REFERENCES desafios(id) ON DELETE CASCADE,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas (planos)
CREATE TABLE assinaturas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  plano VARCHAR(50) DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'premium', 'premium_plus')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tokens de email
CREATE TABLE tokens_email (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('verificacao', 'recuperacao')),
  expira_em TIMESTAMP NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_desafios_usuario_id ON desafios(usuario_id);
CREATE INDEX idx_desafios_status ON desafios(status);
CREATE INDEX idx_propostas_desafio_id ON propostas(desafio_id);
CREATE INDEX idx_propostas_usuario_id ON propostas(usuario_id);
CREATE INDEX idx_comentarios_desafio_id ON comentarios(desafio_id);
CREATE INDEX idx_tokens_usuario_id ON tokens_email(usuario_id);
