package api.mapper;

import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.model.TipoMaterial;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TipoMaterialMapper {

    public TipoMaterial toEntity(TipoMaterialRequestDTO dto) {
        return new TipoMaterial(dto.nome());
    }

    public TipoMaterialResponseDTO toResponse(TipoMaterial tipoMaterial) {
        return new TipoMaterialResponseDTO(tipoMaterial.getId(), tipoMaterial.getNome());
    }

    public List<TipoMaterialResponseDTO> toResponseList(List<TipoMaterial> tiposMateriais) {
        return tiposMateriais.stream().map(this::toResponse).toList();
    }

}
