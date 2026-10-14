package api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Um tipo de material")
public record TipoMaterialResponseDTO(

        @Schema(description = "Id do tipo de material", example = "1")
        Long id,

        @Schema(description = "Nome do tipo de material", example = "Biológico")
        String nome
) {
}
