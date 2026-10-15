package api.enums;

// CAMADA: Enum
// RESPONSABILIDADE: Definir os valores disponível para o tipo de movimentação em MovimentacaoResiduo e seus DTOs (migration V4)
// SITUAÇÃO: implementada
public enum TipoMovimentacaoResiduo {
    ENTRADA("entrada"),
    SAIDA("saida");

    private final String valorBanco;

    TipoMovimentacaoResiduo(String valorBanco) {
        this.valorBanco = valorBanco;
    }

    public String getValorBanco() {
        return valorBanco;
    }
}
