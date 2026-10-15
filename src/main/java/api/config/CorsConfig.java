// Declara o pacote das classes de configuração da aplicação.
package api.config;

// Importa a anotação que marca a classe como fonte de configuração.
import org.springframework.context.annotation.Configuration;
// Importa o registro onde as regras de CORS são declaradas.
import org.springframework.web.servlet.config.annotation.CorsRegistry;
// Importa a interface de configuração do Spring MVC.
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CAMADA: Config
// RESPONSABILIDADE: liberar o acesso do frontend local às rotas da API pelo navegador.
// SITUAÇÃO: implementada
//
// CORS (Cross-Origin Resource Sharing) -- o navegador bloqueia, por padrão, uma
// página servida em uma origem (protocolo + host + porta) de ler a resposta de
// outra origem. O front roda em http://localhost:5173 (Vite) e a API em
// http://localhost:8080: origens diferentes, logo toda requisição do front seria
// barrada pelo navegador sem a liberação abaixo.
//
// Repare que quem bloqueia é o NAVEGADOR, não a API. O Swagger UI servido pela
// própria API usa a mesma origem, e o Postman não aplica a restrição do navegador.
//
// A liberação é explícita de propósito. allowedOrigins("*") abriria a API para
// qualquer site da internet, o que não é necessário aqui.
// Diz ao Spring que esta classe declara configuração.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Chamado pelo Spring no startup para montar as regras de CORS.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                // "/**" = a regra vale para todas as rotas da API.
                .addMapping("/**")
                // Só o endereço do front em desenvolvimento. As duas formas existem
                // porque o navegador trata localhost e 127.0.0.1 como origens distintas.
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                // Os verbos que o front usa. OPTIONS entra sozinho: é o preflight,
                // a pergunta que o navegador faz antes de um POST/PUT/DELETE.
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                // O front envia Content-Type: application/json; "*" evita listar um a um.
                .allowedHeaders("*");
    }
}
