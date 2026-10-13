package api.dto;

import api.enums.TipoUnidadeMedida;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record MaterialRequestDTO(

        @NotBlank(message = "Nome não pode ser vazio!")
        String nome,

        @NotBlank(message = "Preço por unidade não pode ser vazio!")
        @PositiveOrZero(message = "O preço por unidade não pode ser menor que zero!")
        Double precoPorUnidade,

        @NotBlank(message = "Unidade de medida não pode ser vazio!")
        TipoUnidadeMedida unidadeMedida,

        @NotBlank(message = "Tipo de material não pode ser vazio!")
        Long tipoMaterialId
) {
}
