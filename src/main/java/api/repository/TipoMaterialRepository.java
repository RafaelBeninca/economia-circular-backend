package api.repository;

import api.model.TipoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// CAMADA: Repository
// RESPONSABILIDADE: ler e gravar tipos de materiais na tabela tipos_materiais.
// SITUAÇÃO: implementada
@Repository
public interface TipoMaterialRepository extends JpaRepository<TipoMaterial, Long> {
}
