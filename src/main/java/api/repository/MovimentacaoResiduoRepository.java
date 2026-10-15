package api.repository;

import api.model.MovimentacaoResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// CAMADA: Repository
// RESPONSABILIDADE: ler e gravar movimentações na tabela movimentacoes_residuos.
// SITUAÇÃO: implementada
@Repository
public interface MovimentacaoResiduoRepository extends JpaRepository<MovimentacaoResiduo, Long> {

    @Query("SELECT COALESCE(SUM(m.quantidade), 0) FROM MovimentacaoResiduo m WHERE m.material.id = :materialId")
    Double somarQuantidadePorMaterial(@Param("materialId") Long materialId);

}
