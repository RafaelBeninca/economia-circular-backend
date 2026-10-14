package api.model;

import api.enums.TipoMovimentacaoResiduo;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

// CAMADA: Model
// RESPONSABILIDADE: A movimentação (entrada ou saida) de um material originado de uma produção e que deseja ser controlada,
// gravada na tabela movimentacoes_residuos (migration V5).
// SITUAÇÃO: implementada
@Entity
@Table(name = "movimentacoes_residuos")
public class MovimentacaoResiduo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", columnDefinition = "TipoMovimentacaoResiduo")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TipoMovimentacaoResiduo movimentacaoResiduo;

    private Double quantidade;

    private String descricao;

    @ManyToOne
    @JoinColumn(name = "materiais_id")
    private Material material;

    protected MovimentacaoResiduo() {}

    public MovimentacaoResiduo(TipoMovimentacaoResiduo movimentacaoResiduo, Double quantidade, String descricao) {
        this.movimentacaoResiduo = movimentacaoResiduo;
        this.quantidade = quantidade;
        this.descricao = descricao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoMovimentacaoResiduo getMovimentacaoResiduo() {
        return movimentacaoResiduo;
    }

    public void setMovimentacaoResiduo(TipoMovimentacaoResiduo movimentacaoResiduo) {
        this.movimentacaoResiduo = movimentacaoResiduo;
    }

    public Double getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Double quantidade) {
        this.quantidade = quantidade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }
}
