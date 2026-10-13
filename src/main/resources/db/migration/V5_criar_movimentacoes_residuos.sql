CREATE TABLE movimentacoes_residuos (
  id SERIAL NOT NULL PRIMARY KEY,
  materiais_id INTEGER NOT NULL,
  tipo TipoMovimentacaoResiduo NOT NULL,
  quantidade NUMERIC(12, 2) NOT NULL,
  descricao VARCHAR(255) NOT NULL,

  CONSTRAINT fk_movimentacoes_residuos_materiais FOREIGN KEY (materiais_id) REFERENCES materiais(id)

);