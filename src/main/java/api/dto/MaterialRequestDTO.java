package api.dto;

import api.enums.TipoUnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Schema(description = "Dados para criar um material")
public record MaterialRequestDTO(

        @Schema(description = "Nome do material", example = "Metal")
        @NotBlank(message = "Nome não pode ser vazio!")
        String nome,

        @Schema(description = "Preço que o material custa por unidade", example = "1234.56")
        @NotBlank(message = "Preço por unidade não pode ser vazio!")
        @PositiveOrZero(message = "O preço por unidade não pode ser menor que zero!")
        Double precoPorUnidade,

        @Schema(description = "A unidade de medida que o material é mensurado", example = "QUILO")
        @NotBlank(message = "Unidade de medida não pode ser vazio!")
        TipoUnidadeMedida unidadeMedida,

        @Schema(description = "O ID do tipo de material que o material pertence", example = "1")
        @NotBlank(message = "Tipo de material não pode ser vazio!")
        Long tipoMaterialId
) {
}
