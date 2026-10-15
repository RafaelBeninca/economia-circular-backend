package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

// CAMADA: DTO
// RESPONSABILIDADE: o que a API devolve sobre uma movimentação de resíduo.
// SITUAÇÃO: implementada
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
        String descricao,

        @Schema(description = "Quando a movimentação foi registrada. Definida pela API, não pelo cliente",
                example = "2026-10-15T14:23:11")
        LocalDateTime criadoEm
) {
}
