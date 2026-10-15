package api.mapper;

import api.dto.MaterialComSaldoResponseDTO;
import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.MaterialUpdateRequestDTO;
import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.model.Material;
import api.model.TipoMaterial;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// CAMADA: Mapper
// RESPONSABILIDADE: converter MaterialRequestDTO em Material, e Material em MaterialResponseDTO.
//                   É também usado pelo MovimentacaoResiduoMapper, para montar o material
//                   que aparece dentro de cada movimentação.
//                   updateEntity aplica um MaterialUpdateRequestDTO a um Material já existente.
//                   toResponseComSaldo monta o DTO das rotas de /materiais, que leva o saldo junto.
// SITUAÇÃO: implementada
@Component
public class MaterialMapper {

    private final TipoMaterialMapper tipoMaterialMapper;

    public MaterialMapper(TipoMaterialMapper tipoMaterialMapper) {
        this.tipoMaterialMapper = tipoMaterialMapper;
    }

    public Material toEntity(MaterialRequestDTO dto, TipoMaterial tipoMaterial) {
        var material = new Material(dto.nome(), dto.unidadeMedida(), dto.precoPorUnidade());
        material.setTipoMaterial(tipoMaterial);

        return material;
    }

    public void updateEntity(Material material, MaterialUpdateRequestDTO dto) {
        material.setNome(dto.nome());
        material.setPrecoPorUnidade(dto.precoPorUnidade());
    }

    public MaterialResponseDTO toResponse(Material material) {
        return new MaterialResponseDTO(material.getId(), material.getNome(), material.getUnidadeMedida(), material.getPrecoPorUnidade(), this.tipoMaterialMapper.toResponse(material.getTipoMaterial()));
    }

    public List<MaterialResponseDTO> toResponseList(List<Material> materiais) {
        return materiais.stream().map(this::toResponse).toList();
    }

    public MaterialComSaldoResponseDTO toResponseComSaldo(Material material, Double saldo) {
        return new MaterialComSaldoResponseDTO(material.getId(), material.getNome(), material.getUnidadeMedida(), material.getPrecoPorUnidade(), this.tipoMaterialMapper.toResponse(material.getTipoMaterial()), saldo);
    }

    // Recebe os saldos já prontos, em um mapa de id do material para saldo, montado pelo
    // Service a partir de uma única consulta agrupada. getOrDefault cobre o material que
    // nunca foi movimentado: ele não aparece no agrupamento, e o saldo dele é zero.
    public List<MaterialComSaldoResponseDTO> toResponseComSaldoList(List<Material> materiais, Map<Long, Double> saldosPorMaterialId) {
        return materiais.stream()
                .map(material -> this.toResponseComSaldo(material, saldosPorMaterialId.getOrDefault(material.getId(), 0.0)))
                .toList();
    }

}
