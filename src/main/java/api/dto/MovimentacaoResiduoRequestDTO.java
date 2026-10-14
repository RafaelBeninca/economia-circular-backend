package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// CAMADA: DTO
// RESPONSABILIDADE: o que o cliente envia para cadastrar uma movimentação de resíduo
// SITUAÇÃO: implementada
@Schema(description = "Dados para criar uma movimentação de resíduo")
public record MovimentacaoResiduoRequestDTO(

        @Schema(description = "O ID do material da movimentação", example = "1")
        @NotNull(message = "Material não pode ser vazio!")
        Long materialId,

        @Schema(description = "O tipo da movimentação", example = "SAIDA")
        @NotNull(message = "Tipo da movimentação não pode ser vazio!")
        TipoMovimentacaoResiduo movimentacaoResiduo,

        @Schema(description = "A quantidade da movimentação", example = "-15")
        @NotNull(message = "Quantidade não pode ser vazia!")
        Double quantidade,

        @Schema(description = "A descrição da movimentação", example = "Saída referente à venda do material para terceiros")
        @NotBlank(message = "Descrição não pode ser vazia!")
        String descricao
) {
}
