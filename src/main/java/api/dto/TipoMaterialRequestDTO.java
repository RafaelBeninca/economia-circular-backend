package api.dto;

import jakarta.validation.constraints.NotBlank;

public record TipoMaterialRequestDTO(

        @NotBlank(message = "Nome não pode ser vazio!")
        String nome
) {
}
