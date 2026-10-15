package api.config;

import api.enums.TipoMovimentacaoResiduo;
import api.enums.TipoUnidadeMedida;
import org.hibernate.boot.model.relational.Database;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.hibernate.type.descriptor.ValueBinder;
import org.hibernate.type.descriptor.ValueExtractor;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.descriptor.jdbc.BasicBinder;
import org.hibernate.type.descriptor.jdbc.BasicExtractor;
import org.hibernate.type.descriptor.jdbc.JdbcLiteralFormatter;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Locale;

// CAMADA: Config / persistência
// RESPONSABILIDADE: adaptar os enums Java aos tipos PostgreSQL criados pelo Flyway.
// REGRAS: JSON continua em maiúsculas; o banco usa os valores das migrations V2/V4.
//         O Hibernate não pode apagar/recriar esses tipos, pois CASCADE remove colunas.
// SITUAÇÃO: implementada para o Hibernate 6.6 usado pelo Spring Boot deste projeto.
public class EnumPostgreSqlJdbcType extends PostgreSQLEnumJdbcType {

    // Os dois pontos de entrada públicos do Hibernate 6.6 chegam a este método.
    // Não registrar DDL auxiliar deixa a criação dos tipos exclusivamente com Flyway,
    // inclusive quando ddl-auto=update é mantido para as demais colunas do projeto.
    @Override
    protected void addAuxiliaryDatabaseObjects(JavaType<?> javaType, Database database,
                                               boolean sortEnumValues) {
        // Intencionalmente vazio: os tipos já pertencem às migrations.
    }

    private static String valorBanco(Object valor) {
        if (valor instanceof TipoUnidadeMedida unidade) {
            return unidade.getValorBanco();
        }
        if (valor instanceof TipoMovimentacaoResiduo movimentacao) {
            return movimentacao.getValorBanco();
        }
        throw new IllegalArgumentException("Enum sem mapeamento PostgreSQL neste projeto: " + valor);
    }

    @Override
    public <X> ValueBinder<X> getBinder(JavaType<X> javaType) {
        return new BasicBinder<>(javaType, this) {
            @Override
            protected void doBind(PreparedStatement statement, X value, int index,
                                  WrapperOptions options) throws SQLException {
                // OTHER faz o driver enviar um enum PostgreSQL, em vez de varchar.
                statement.setObject(index, valorBanco(value), Types.OTHER);
            }

            @Override
            protected void doBind(CallableStatement statement, X value, String name,
                                  WrapperOptions options) throws SQLException {
                statement.setObject(name, valorBanco(value), Types.OTHER);
            }
        };
    }

    @Override
    public <X> ValueExtractor<X> getExtractor(JavaType<X> javaType) {
        return new BasicExtractor<>(javaType, this) {
            private X converter(String value, WrapperOptions options) {
                // Locale.ROOT impede que o idioma da máquina altere o nome da constante.
                return javaType.wrap(value == null ? null : value.toUpperCase(Locale.ROOT), options);
            }

            @Override
            protected X doExtract(ResultSet result, int index, WrapperOptions options) throws SQLException {
                return converter(result.getString(index), options);
            }

            @Override
            protected X doExtract(CallableStatement statement, int index,
                                  WrapperOptions options) throws SQLException {
                return converter(statement.getString(index), options);
            }

            @Override
            protected X doExtract(CallableStatement statement, String name,
                                  WrapperOptions options) throws SQLException {
                return converter(statement.getString(name), options);
            }
        };
    }

    @Override
    public <T> JdbcLiteralFormatter<T> getJdbcLiteralFormatter(JavaType<T> javaType) {
        // Também respeita os valores do banco quando uma consulta usa literal de enum.
        // Nome do tipo e valor vêm das classes/constantes conhecidas, nunca do cliente.
        return (sql, value, dialect, options) -> sql.appendSql("'" + valorBanco(value)
                + "'::" + javaType.getJavaTypeClass().getSimpleName());
    }
}
