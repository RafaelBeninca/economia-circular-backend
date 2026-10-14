package api.repository;

import api.model.MovimentacaoResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// CAMADA: Repository
// RESPONSABILIDADE: ler e gravar movimentações na tabela movimentacoes_residuos.
// SITUAÇÃO: implementada
@Repository
public interface MovimentacaoResiduoRepository extends JpaRepository<MovimentacaoResiduo, Long> {
}
