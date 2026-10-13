CREATE TABLE materiais (
   id SERIAL NOT NULL PRIMARY KEY,
   nome VARCHAR(255) NOT NULL,
   unidade_medida tipos_unidades_medidas NOT NULL,
   preco_por_unidade NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
   tipos_materiais_id INTEGER NOT NULL,

   CONSTRAINT fk_materiais_tipos_material FOREIGN KEY (tipos_materiais_id) REFERENCES tipos_materiais(id)
);