package api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// CAMADA: DTO
// RESPONSABILIDADE: o que o cliente envia para editar um material (o nome e o preço por unidade são os campos editáveis)
// SITUAÇÃO: implementada
@Schema(description = "Dados para editar um material")
public record MaterialUpdateRequestDTO(

        @Schema(description = "Nome do material", example = "Metal")
        @NotBlank(message = "Nome não pode ser vazio!")
        String nome,

        @Schema(description = "Preço que o material custa por unidade", example = "1234.56")
        @NotNull(message = "O preço por unidade não pode ser vazio!")
        @Positive(message = "O preço deve ser maior que zero!")
        Double precoPorUnidade
) {
}
