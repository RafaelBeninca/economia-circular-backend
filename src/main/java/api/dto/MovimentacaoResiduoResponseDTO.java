package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Uma movimentação de resíduo")
public record MovimentacaoResiduoResponseDTO(

        @Schema(description = "Id da movimentação", example = "1")
        Long id,

        @Schema(description = "O material da movimentação")
        MaterialResponseDTO material,

        @Schema(description = "O tipo da movimentação", example = "ENTRADA")
        TipoMovimentacaoResiduo tipoMovimentacaoResiduo,

        @Schema(description = "A quantidade da movimentação", example = "15.50")
        Double quantidade,

        @Schema(description = "A descrição da movimentação", example = "Entrada referente à sobra da produção")
        String descricao
) {
}
