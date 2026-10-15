package api.controller;

import api.dto.*;
import api.service.MaterialService;
import api.service.TipoMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CAMADA: Controller
// RESPONSABILIDADE: receber as requisições de /materiais.
// REGRAS: Não se aplicam aqui
// ROTAS ATENDIDAS: GET /materiais, GET /materiais/{id}, POST /materiais e DELETE /materiais/{id} (/materiais em docs/contrato-da-api.md)
// SITUAÇÃO: implementada
@RestController
@RequestMapping("/materiais")
@Tag(name = "Materiais", description = "Cadastro e consulta de materiais")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @Operation(summary = "Lista os materiais", description = "Sem materiais cadastrados, a lista vem vazia, não 404.")
    @ApiResponse(responseCode = "200", description = "Lista de materiais (pode vir vazia)")
    @GetMapping
    public List<MaterialResponseDTO> listar() {
        return this.materialService.listar();
    }

    @Operation(summary = "Busca um material pelo id")
    @ApiResponse(responseCode = "200", description = "Material encontrado")
    @ApiResponse(responseCode = "404", description = "Não existe material com esse id",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @GetMapping("/{id}")
    public MaterialResponseDTO listarPorId(@Parameter(description = "Id do material", example = "1") @PathVariable Long id) {
        return this.materialService.listarPorId(id);
    }

    @Operation(summary = "Cadastra um material", description = "id é definido pela API, não pelo cliente.")
    @ApiResponse(responseCode = "201", description = "Material cadastrado: o corpo já traz o id gerado")
    @ApiResponse(responseCode = "400", description = "Corpo inválido: a lista \"campos\" diz o que corrigir",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @PostMapping
    public ResponseEntity<MaterialResponseDTO> criar(@RequestBody @Valid MaterialRequestDTO requestDTO) {
        var material = this.materialService.criar(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(material);
    }

    @Operation(summary = "Remove um material")
    @ApiResponse(responseCode = "204", description = "Material removido")
    @ApiResponse(responseCode = "400", description = "O material ainda está sendo usado por alguma movimentação",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @ApiResponse(responseCode = "404", description = "Não existe material com esse id",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@Parameter(description = "Id do material", example = "1") @PathVariable Long id) {
        this.materialService.remover(id);

        return ResponseEntity.noContent().build();
    }

}
