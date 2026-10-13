package api.enums;

public enum TipoUnidadeMedida {
    UNIDADE("unidade"),
    PECA("peca"),
    METRO("metro"),
    QUILO("quilo");

    private final String valorBanco;

    TipoUnidadeMedida(String valorBanco) {
        this.valorBanco = valorBanco;
    }

    public String getValorBanco() {
        return valorBanco;
    }
}
