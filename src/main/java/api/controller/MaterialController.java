package api.controller;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.service.MaterialService;
import api.service.TipoMaterialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/materiais")
@Tag(name = "Materiais", description = "Cadastro e consulta de materiais")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
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
    public MaterialResponseDTO criar(@RequestBody @Valid MaterialRequestDTO requestDTO) {
        return this.materialService.criar(requestDTO);
    }

}
