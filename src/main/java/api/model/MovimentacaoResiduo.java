package api.model;

import api.enums.TipoMovimentacaoResiduo;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.LocalDateTime;

// CAMADA: Model
// RESPONSABILIDADE: A movimentação (entrada ou saida) de um material originado de uma produção e que deseja ser controlada,
// gravada na tabela movimentacoes_residuos (migrations V5 e V6).
// SITUAÇÃO: implementada
@Entity
@Table(name = "movimentacoes_residuos")
public class MovimentacaoResiduo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", columnDefinition = "TipoMovimentacaoResiduo", nullable = false)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TipoMovimentacaoResiduo movimentacaoResiduo;

    @Column(nullable = false)
    private Double quantidade;

    @Column(nullable = false, length = 255)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "materiais_id")
    private Material material;

    // @CreationTimestamp: o Hibernate preenche este campo no INSERT, sozinho. Não existe
    // setter de propósito -- a data do registro não é escolhida por quem chama a API, e
    // updatable = false impede que um UPDATE futuro a sobrescreva.
    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

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

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
