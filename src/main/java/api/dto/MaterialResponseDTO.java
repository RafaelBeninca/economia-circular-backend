package api.dto;

import api.enums.TipoUnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;

// CAMADA: DTO
// RESPONSABILIDADE: o que a API devolve sobre um material.
// SITUAÇÃO: implementada
@Schema(description = "Um material")
public record MaterialResponseDTO(

        @Schema(description = "Id do material", example = "1")
        Long id,

        @Schema(description = "Nome do material", example = "Metal")
        String nome,

        @Schema(description = "A unidade de medida que o material é mensurado", example = "QUILO")
        TipoUnidadeMedida unidadeMedida,

        @Schema(description = "Preço que o material custa por unidade", example = "1234.56")
        Double precoPorUnidade,

        @Schema(description = "O tipo de material que o material pertence")
        TipoMaterialResponseDTO tipoMaterial
) {
}
