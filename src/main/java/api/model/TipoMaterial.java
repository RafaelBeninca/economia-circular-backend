package api.model;

import jakarta.persistence.*;

import java.util.List;

// CAMADA: Model
// RESPONSABILIDADE: Uma categoria que um material pode pertencer, gravada na tabela tipos_materiais (migration V1).
// SITUAÇÃO: implementada
@Entity
@Table(name = "tipos_materiais")
public class TipoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nome;

    @OneToMany(mappedBy = "tipoMaterial")
    private List<Material> materiais;

    protected TipoMaterial() {}

    public TipoMaterial(String nome) {
        this.nome = nome;
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
}
