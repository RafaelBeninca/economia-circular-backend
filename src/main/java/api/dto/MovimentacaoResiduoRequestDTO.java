package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import jakarta.validation.constraints.NotBlank;

public record MovimentacaoResiduoRequestDTO(

        @NotBlank(message = "Material não pode ser vazio!")
        Long materialId,

        @NotBlank(message = "Tipo da movimentação não pode ser vazio!")
        TipoMovimentacaoResiduo movimentacaoResiduo,

        @NotBlank(message = "Quantidade não pode ser vazia!")
        Double quantidade,

        @NotBlank(message = "Descrição não pode ser vazia!")
        String descricao
) {
}
