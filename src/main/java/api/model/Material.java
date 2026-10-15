package api.model;

import api.enums.TipoUnidadeMedida;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import api.config.EnumPostgreSqlJdbcType;

import java.util.List;

// CAMADA: Model
// RESPONSABILIDADE: Um material que pode sobrar originado de uma produção, gravada na tabela materiais (migration V3).
// SITUAÇÃO: implementada
@Entity
@Table(name = "materiais")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida", columnDefinition = "TipoUnidadeMedida", nullable = false)
    // Usa os valores das migrations sem registrar DROP/CREATE dos tipos no Hibernate.
    @JdbcType(EnumPostgreSqlJdbcType.class)
    private TipoUnidadeMedida unidadeMedida;

    @Column(nullable = false)
    private Double precoPorUnidade;

    @ManyToOne
    @JoinColumn(name = "tipos_materiais_id")
    private TipoMaterial tipoMaterial;

    @OneToMany(mappedBy = "material")
    private List<MovimentacaoResiduo> movimentacoesResiduos;


    protected Material() {}

    public Material(String nome, TipoUnidadeMedida unidadeMedida, Double precoPorUnidade) {
        this.nome = nome;
        this.unidadeMedida = unidadeMedida;
        this.precoPorUnidade = precoPorUnidade;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoUnidadeMedida getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(TipoUnidadeMedida unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public Double getPrecoPorUnidade() {
        return precoPorUnidade;
    }

    public void setPrecoPorUnidade(Double precoPorUnidade) {
        this.precoPorUnidade = precoPorUnidade;
    }

    public TipoMaterial getTipoMaterial() {
        return tipoMaterial;
    }

    public void setTipoMaterial(TipoMaterial tipoMaterial) {
        this.tipoMaterial = tipoMaterial;
    }
}
