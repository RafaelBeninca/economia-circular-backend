-- DEFAULT NOW() é obrigatório aqui: a coluna nasce NOT NULL e a tabela pode já ter
-- linhas, que precisam de um valor no momento do ALTER.
ALTER TABLE movimentacoes_residuos
    ADD COLUMN criado_em TIMESTAMP NOT NULL DEFAULT NOW();
