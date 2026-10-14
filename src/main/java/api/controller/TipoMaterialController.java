package api.controller;

import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.service.TipoMaterialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tiposMateriais")
@Tag(name = "Tipos Materiais", description = "Cadastro e consulta dos tipos de materiais")
public class TipoMaterialController {

    private final TipoMaterialService tipoMaterialService;

    public TipoMaterialController(TipoMaterialService tipoMaterialService) {
        this.tipoMaterialService = tipoMaterialService;
    }

    @GetMapping
    public List<TipoMaterialResponseDTO> listar() {
        return this.tipoMaterialService.listar();
    }

    @GetMapping("/{id}")
    public TipoMaterialResponseDTO listarPorId(@PathVariable Long id) {
        return this.tipoMaterialService.listarPorId(id);
    }

    @PostMapping
    public TipoMaterialResponseDTO criar(@RequestBody @Valid TipoMaterialRequestDTO requestDTO) {
        return this.tipoMaterialService.criar(requestDTO);
    }

}
