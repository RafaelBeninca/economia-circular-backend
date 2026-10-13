package api.enums;

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
