package api.controller;

import api.dto.ErroDTO;
import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.service.TipoMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// CAMADA: Controller
// RESPONSABILIDADE: receber as requisições de /tiposMateriais.
// REGRAS: Não se aplicam aqui
// ROTAS ATENDIDAS: GET /tiposMateriais, GET /tiposMateriais/{id} e POST /movimentacoesResiduos (/tiposMateriais em docs/contrato-da-api.md)
// SITUAÇÃO: implementada
@RestController
@RequestMapping("/tiposMateriais")
@Tag(name = "Tipos Materiais", description = "Cadastro e consulta dos tipos de materiais")
public class TipoMaterialController {

    private final TipoMaterialService tipoMaterialService;

    public TipoMaterialController(TipoMaterialService tipoMaterialService) {
        this.tipoMaterialService = tipoMaterialService;
    }

    @Operation(summary = "Lista os tipos de materiais", description = "Sem tipos de materiais cadastrados, a lista vem vazia, não 404.")
    @ApiResponse(responseCode = "200", description = "Lista de tipos de materiais (pode vir vazia)")
    @GetMapping
    public List<TipoMaterialResponseDTO> listar() {
        return this.tipoMaterialService.listar();
    }

    @Operation(summary = "Busca um tipo de material pelo id")
    @ApiResponse(responseCode = "200", description = "Tipo de material encontrado")
    @ApiResponse(responseCode = "404", description = "Não existe tipo de material com esse id",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @GetMapping("/{id}")
    public TipoMaterialResponseDTO listarPorId(@Parameter(description = "Id do tipo de material", example = "1") @PathVariable Long id) {
        return this.tipoMaterialService.listarPorId(id);
    }

    @Operation(summary = "Cadastra um tipo de material", description = "id é definido pela API, não pelo cliente.")
    @ApiResponse(responseCode = "201", description = "Tipo de material cadastrado: o corpo já traz o id gerado")
    @ApiResponse(responseCode = "400", description = "Corpo inválido: a lista \"campos\" diz o que corrigir",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @PostMapping
    public ResponseEntity<TipoMaterialResponseDTO> criar(@RequestBody @Valid TipoMaterialRequestDTO requestDTO) {
        var tipoMaterial = this.tipoMaterialService.criar(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(tipoMaterial);
    }

}
