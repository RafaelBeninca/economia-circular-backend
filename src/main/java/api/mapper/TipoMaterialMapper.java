package api.mapper;

import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.dto.TipoMaterialUpdateRequestDTO;
import api.model.TipoMaterial;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

// CAMADA: Mapper
// RESPONSABILIDADE: converter TipoMaterialRequestDTO em TipoMaterial, e TipoMaterial em TipoMaterialResponseDTO.
//                   Também é usado pelo MaterialMapper, para montar o tipo de material
//                   que aparece dentro de cada material.
//                   updateEntity aplica um TipoMaterialUpdateRequestDTO a um TipoMaterial já existente.
// SITUAÇÃO: implementada
@Component
public class TipoMaterialMapper {

    public TipoMaterial toEntity(TipoMaterialRequestDTO dto) {
        return new TipoMaterial(dto.nome());
    }

    public void updateEntity(TipoMaterial tipoMaterial, TipoMaterialUpdateRequestDTO dto) {
        tipoMaterial.setNome(dto.nome());
    }

    public TipoMaterialResponseDTO toResponse(TipoMaterial tipoMaterial) {
        return new TipoMaterialResponseDTO(tipoMaterial.getId(), tipoMaterial.getNome());
    }

    public List<TipoMaterialResponseDTO> toResponseList(List<TipoMaterial> tiposMateriais) {
        return tiposMateriais.stream().map(this::toResponse).toList();
    }

}
