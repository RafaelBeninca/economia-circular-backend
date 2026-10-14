package api.repository;

import api.model.MovimentacaoResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimentacaoResiduoRepository extends JpaRepository<MovimentacaoResiduo, Long> {
}
