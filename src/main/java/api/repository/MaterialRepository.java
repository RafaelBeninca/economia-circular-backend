package api.repository;

import api.enums.TipoUnidadeMedida;
import api.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// CAMADA: Repository
// RESPONSABILIDADE: ler e gravar materiais na tabela materiais.
// SITUAÇÃO: implementada
@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    boolean existsByNomeIgnoreCaseAndUnidadeMedida(String nome, TipoUnidadeMedida unidadeMedida);
}
