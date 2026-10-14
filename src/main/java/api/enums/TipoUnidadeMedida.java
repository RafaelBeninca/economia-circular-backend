package api.enums;

// CAMADA: Enum
// RESPONSABILIDADE: Definir os valores disponível para as unidades de medidas de Material e seus DTOs (migration V2)
// SITUAÇÃO: implementada
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
