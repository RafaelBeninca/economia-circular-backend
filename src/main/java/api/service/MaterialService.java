package api.service;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.mapper.MaterialMapper;
import api.repository.MaterialRepository;
import api.repository.TipoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar e consultar materiais.
// REGRAS:
//         R3: Não podem exitir materiais duplicados (com mesmo nome e unidade de medida)
// ROTAS ATENDIDAS: GET /materiais, GET /materiais/{id} e POST /materiais
// SITUAÇÃO: implementada.
@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;
    private final TipoMaterialRepository tipoMaterialRepository;

    public MaterialService(MaterialRepository materialRepository, MaterialMapper materialMapper, TipoMaterialRepository tipoMaterialRepository) {
        this.materialRepository = materialRepository;
        this.materialMapper = materialMapper;
        this.tipoMaterialRepository = tipoMaterialRepository;
    }

    public List<MaterialResponseDTO> listar() {
        return materialMapper.toResponseList(this.materialRepository.findAll());
    }

    public MaterialResponseDTO listarPorId(Long id) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        return this.materialMapper.toResponse(material);
    }

    public MaterialResponseDTO criar(MaterialRequestDTO requestDTO) {
        var tipoMaterial = this.tipoMaterialRepository.findById(requestDTO.tipoMaterialId()).orElseThrow(() -> new RecursoNaoEncontradoException("Tipo Material não encontrado!"));

        if (this.materialRepository.existsByNomeIgnoreCaseAndUnidadeMedida(requestDTO.nome().trim(), requestDTO.unidadeMedida())) {
            throw new RegraDeNegocioException("Já existe um material com esse nome e unidade de medida!");
        }

        var material = this.materialRepository.save(materialMapper.toEntity(requestDTO, tipoMaterial));

        return this.materialMapper.toResponse(material);
    }
}
