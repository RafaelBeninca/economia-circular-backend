package api.controller;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.MovimentacaoResiduoRequestDTO;
import api.dto.MovimentacaoResiduoResponseDTO;
import api.service.MaterialService;
import api.service.MovimentacaoResiduoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimentacoesResiduos")
@Tag(name = "Movimentações de Resíduos", description = "Cadastro e consulta de movimentações de entrada e saída de resíduos")
public class MovimentacaoResiduoController {

    private final MovimentacaoResiduoService movimentacaoResiduoService;

    public MovimentacaoResiduoController(MovimentacaoResiduoService movimentacaoResiduoService) {
        this.movimentacaoResiduoService = movimentacaoResiduoService;
    }

    @GetMapping
    public List<MovimentacaoResiduoResponseDTO> listar() {
        return this.movimentacaoResiduoService.listar();
    }

    @GetMapping("/{id}")
    public MovimentacaoResiduoResponseDTO listarPorId(@PathVariable Long id) {
        return this.movimentacaoResiduoService.listarPorId(id);
    }

    @PostMapping
    public MovimentacaoResiduoResponseDTO criar(@RequestBody @Valid MovimentacaoResiduoRequestDTO requestDTO) {
        return this.movimentacaoResiduoService.criar(requestDTO);
    }

}
