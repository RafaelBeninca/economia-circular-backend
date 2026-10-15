package api.repository;

import api.model.MovimentacaoResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// CAMADA: Repository
// RESPONSABILIDADE: ler e gravar movimentações na tabela movimentacoes_residuos.
// SITUAÇÃO: implementada
@Repository
public interface MovimentacaoResiduoRepository extends JpaRepository<MovimentacaoResiduo, Long> {

    @Query("SELECT COALESCE(SUM(m.quantidade), 0) FROM MovimentacaoResiduo m WHERE m.material.id = :materialId")
    Double somarQuantidadePorMaterial(@Param("materialId") Long materialId);

    // O saldo de TODOS os materiais em uma única query, agrupando por material.
    //
    // Por que não chamar somarQuantidadePorMaterial dentro de um laço: seriam N consultas
    // ao banco para montar a lista de N materiais (o problema conhecido como N+1). Com o
    // GROUP BY, o banco devolve todos os saldos de uma vez. Dá para conferir no console,
    // já que spring.jpa.show-sql=true está ligado.
    //
    // Atenção: materiais que nunca foram movimentados não aparecem no resultado, porque não
    // têm linha nenhuma para agrupar. Quem consome precisa tratar a ausência como saldo zero.
    @Query("SELECT m.material.id AS materialId, COALESCE(SUM(m.quantidade), 0) AS saldo "
            + "FROM MovimentacaoResiduo m GROUP BY m.material.id")
    List<SaldoPorMaterial> somarQuantidadeDeTodosOsMateriais();

    // Projeção: o Spring Data implementa esta interface sozinho, ligando cada método ao
    // apelido (AS) correspondente da query acima. Evita trabalhar com Object[].
    interface SaldoPorMaterial {
        Long getMaterialId();

        Double getSaldo();
    }

    // Derived query: o Spring Data monta o SQL a partir do nome do método.
    // "FindByMaterialId" vira WHERE materiais_id = ?, e "OrderByCriadoEmDesc" ordena
    // da movimentação mais recente para a mais antiga -- a ordem de um extrato.
    List<MovimentacaoResiduo> findByMaterialIdOrderByCriadoEmDesc(Long materialId);

    // A mesma ordenação para quando nenhum material é informado. Sem isso, a lista sairia
    // ordenada só por acaso, na ordem em que o banco devolvesse as linhas.
    List<MovimentacaoResiduo> findAllByOrderByCriadoEmDesc();

}
