package api.controller;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.service.MaterialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tiposTarefas")
public class MovimentacaoResiduoController {

    private final MaterialService materialService;

    public MovimentacaoResiduoController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public List<MaterialResponseDTO> listar() {
        return this.materialService.listar();
    }

    @GetMapping("/{id}")
    public MaterialResponseDTO listarPorId(@PathVariable Long id) {
        return this.materialService.listarPorId(id);
    }

    @PostMapping
    public MaterialResponseDTO criar(@RequestBody MaterialRequestDTO requestDTO) {
        return this.materialService.criar(requestDTO);
    }

}
