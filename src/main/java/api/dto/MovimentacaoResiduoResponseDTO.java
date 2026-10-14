package api.dto;

import api.enums.TipoMovimentacaoResiduo;
import jakarta.validation.constraints.NotBlank;

public record MovimentacaoResiduoResponseDTO(
        Long id,
        MaterialResponseDTO material,
        TipoMovimentacaoResiduo tipoMovimentacaoResiduo,
        Double quantidade,
        String descricao
) {
}
