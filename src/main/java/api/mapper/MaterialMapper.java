package api.mapper;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.model.Material;
import api.model.TipoMaterial;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

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

    public MaterialResponseDTO toResponse(Material material) {
        return new MaterialResponseDTO(material.getId(), material.getNome(), material.getUnidadeMedida(), material.getPrecoPorUnidade(), this.tipoMaterialMapper.toResponse(material.getTipoMaterial()));
    }

    public List<MaterialResponseDTO> toResponseList(List<Material> materiais) {
        return materiais.stream().map(this::toResponse).toList();
    }

}
