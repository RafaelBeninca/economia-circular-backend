package api.controller;

import api.dto.*;
import api.service.MaterialService;
import api.service.MovimentacaoResiduoService;
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
// RESPONSABILIDADE: receber as requisições de /movimentacoesResiduos.
// REGRAS: Não se aplicam aqui
// ROTAS ATENDIDAS: GET /movimentacoesResiduos, GET /movimentacoesResiduos/{id} e POST /movimentacoesResiduos (/movimentacoesResiduos em docs/contrato-da-api.md)
// SITUAÇÃO: implementada
@RestController
@RequestMapping("/movimentacoesResiduos")
@Tag(name = "Movimentações de Resíduos", description = "Cadastro e consulta de movimentações de entrada e saída de resíduos")
public class MovimentacaoResiduoController {

    private final MovimentacaoResiduoService movimentacaoResiduoService;

    public MovimentacaoResiduoController(MovimentacaoResiduoService movimentacaoResiduoService) {
        this.movimentacaoResiduoService = movimentacaoResiduoService;
    }

    @Operation(summary = "Lista as movimentações de resíduos", description = "Sem movimentações cadastradas, a lista vem vazia, não 404.")
    @ApiResponse(responseCode = "200", description = "Lista de movimentações de resíduos (pode vir vazia)")
    @GetMapping
    public List<MovimentacaoResiduoResponseDTO> listar() {
        return this.movimentacaoResiduoService.listar();
    }

    @Operation(summary = "Busca uma movimentação pelo id")
    @ApiResponse(responseCode = "200", description = "Movimentação encontrada")
    @ApiResponse(responseCode = "404", description = "Não existe movimentação com esse id",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @GetMapping("/{id}")
    public MovimentacaoResiduoResponseDTO listarPorId(@Parameter(description = "Id da movimentação", example = "1") @PathVariable Long id) {
        return this.movimentacaoResiduoService.listarPorId(id);
    }

    @Operation(summary = "Cadastra uma movimentação", description = "id é definido pela API, não pelo cliente.")
    @ApiResponse(responseCode = "201", description = "Movimentação cadastrada: o corpo já traz o id gerado")
    @ApiResponse(responseCode = "400", description = "Corpo inválido: a lista \"campos\" diz o que corrigir",
            content = @Content(schema = @Schema(implementation = ErroDTO.class)))
    @PostMapping
    public ResponseEntity<MovimentacaoResiduoResponseDTO> criar(@RequestBody @Valid MovimentacaoResiduoRequestDTO requestDTO) {
        var movimentacao = this.movimentacaoResiduoService.criar(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(movimentacao);
    }

}
