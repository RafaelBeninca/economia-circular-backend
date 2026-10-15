package api.service;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.MaterialUpdateRequestDTO;
import api.mapper.MaterialMapper;
import api.repository.MaterialRepository;
import api.repository.TipoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar, consultar e editar materiais.
// REGRAS:
//         R3: Não podem existir materiais duplicados (com mesmo nome e unidade de medida). Vale ao cadastrar e ao editar o nome
// ROTAS ATENDIDAS: GET /materiais, GET /materiais/{id}, POST /materiais, PUT /materiais/{id} e DELETE /materiais/{id}
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

    public MaterialResponseDTO atualizar(Long id, MaterialUpdateRequestDTO requestDTO) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        // R3 no editar: a unidade de medida não muda, então a checagem usa a do próprio material.
        // O "AndIdNot" libera o material de colidir com ele mesmo quando só o preço muda.
        if (this.materialRepository.existsByNomeIgnoreCaseAndUnidadeMedidaAndIdNot(requestDTO.nome().trim(), material.getUnidadeMedida(), id)) {
            throw new RegraDeNegocioException("Já existe um material com esse nome e unidade de medida!");
        }

        this.materialMapper.updateEntity(material, requestDTO);

        return this.materialMapper.toResponse(this.materialRepository.save(material));
    }

    public void remover(Long id) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        this.materialRepository.delete(material);
    }
}
