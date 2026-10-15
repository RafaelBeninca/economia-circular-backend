package api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

// CAMADA: DTO
// RESPONSABILIDADE: o que o cliente envia para editar um tipo de material
// SITUAÇÃO: implementada
@Schema(description = "Dados para editar um tipo de material")
public record TipoMaterialUpdateRequestDTO(

        @Schema(description = "Nome do tipo de material", example = "Biológico")
        @NotBlank(message = "Nome não pode ser vazio!")
        String nome
) {
}
