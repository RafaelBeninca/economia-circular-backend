package api.dto;

import api.enums.TipoUnidadeMedida;

public record MaterialResponseDTO(
        Long id,
        String nome,
        TipoUnidadeMedida unidadeMedida,
        Double precoPorUnidade,
        TipoMaterialResponseDTO tipoMaterial
) {
}
