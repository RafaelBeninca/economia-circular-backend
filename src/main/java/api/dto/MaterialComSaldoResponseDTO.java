package api.dto;

import api.enums.TipoUnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;

// CAMADA: DTO
// RESPONSABILIDADE: o que a API devolve sobre um material quando ele é o recurso pedido
//                   (as rotas de /materiais). É o MaterialResponseDTO mais o saldo.
//
//                   Por que dois DTOs: o saldo é a soma das movimentações daquele material,
//                   e só faz sentido quando o material é o assunto da resposta. Dentro de uma
//                   movimentação, o material aparece como contexto e continua usando o
//                   MaterialResponseDTO -- assim o objeto material aninhado mantém seus campos e
//                   não é preciso somar o saldo de cada material de cada movimentação da lista.
// SITUAÇÃO: implementada
@Schema(description = "Um material, com o saldo atual")
public record MaterialComSaldoResponseDTO(

        @Schema(description = "Id do material", example = "1")
        Long id,

        @Schema(description = "Nome do material", example = "Sucata de alumínio")
        String nome,

        @Schema(description = "A unidade de medida que o material é mensurado", example = "QUILO")
        TipoUnidadeMedida unidadeMedida,

        @Schema(description = "Preço que o material custa por unidade", example = "8.5")
        Double precoPorUnidade,

        @Schema(description = "O tipo de material que o material pertence")
        TipoMaterialResponseDTO tipoMaterial,

        @Schema(description = "Soma de todas as movimentações do material. "
                + "É zero quando o material ainda não foi movimentado", example = "10.0")
        Double saldo
) {
}
