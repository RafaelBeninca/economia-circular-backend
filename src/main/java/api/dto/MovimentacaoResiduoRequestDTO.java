package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Dados para criar uma movimentação de resíduo")
public record MovimentacaoResiduoRequestDTO(

        @Schema(description = "O ID do material da movimentação", example = "1")
        @NotBlank(message = "Material não pode ser vazio!")
        Long materialId,

        @Schema(description = "O tipo da movimentação", example = "SAIDA")
        @NotBlank(message = "Tipo da movimentação não pode ser vazio!")
        TipoMovimentacaoResiduo movimentacaoResiduo,

        @Schema(description = "A quantidade da movimentação", example = "-15")
        @NotBlank(message = "Quantidade não pode ser vazia!")
        Double quantidade,

        @Schema(description = "A descrição da movimentação", example = "Saída referente à venda do material para terceiros")
        @NotBlank(message = "Descrição não pode ser vazia!")
        String descricao
) {
}
