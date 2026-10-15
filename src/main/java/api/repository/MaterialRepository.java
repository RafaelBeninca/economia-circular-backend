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

    // Mesma checagem da R3, ignorando o próprio material editado: sem o "IdNot",
    // editar só o preço de um material acusaria ele mesmo como duplicado.
    boolean existsByNomeIgnoreCaseAndUnidadeMedidaAndIdNot(String nome, TipoUnidadeMedida unidadeMedida, Long id);
}
