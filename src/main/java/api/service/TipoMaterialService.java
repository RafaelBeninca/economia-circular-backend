package api.service;

import api.dto.TipoMaterialRequestDTO;
import api.dto.TipoMaterialResponseDTO;
import api.dto.TipoMaterialUpdateRequestDTO;
import api.mapper.TipoMaterialMapper;
import api.model.TipoMaterial;
import api.repository.TipoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar, consultar e editar tipos de materiais
// REGRAS: Não se aplicam aqui
// ROTAS ATENDIDAS: GET /tiposMateriais, GET /tiposMateriais/{id}, POST /tiposMateriais, PUT /tiposMateriais/{id} e DELETE /tiposMateriais/{id} (/tiposMateriais em docs/contrato-da-api.md)
// SITUAÇÃO: implementada
@Service
public class TipoMaterialService {

    private final TipoMaterialRepository tipoMaterialRepository;
    private final TipoMaterialMapper tipoMaterialMapper;

    public TipoMaterialService(TipoMaterialRepository tipoMaterialRepository, TipoMaterialMapper tipoMaterialMapper) {
        this.tipoMaterialRepository = tipoMaterialRepository;
        this.tipoMaterialMapper = tipoMaterialMapper;
    }

    public List<TipoMaterialResponseDTO> listar() {
        return tipoMaterialMapper.toResponseList(this.tipoMaterialRepository.findAll());
    }

    public TipoMaterialResponseDTO listarPorId(Long id) {
        var tipoMaterial = this.tipoMaterialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Tipo material não encontrado!"));

        return this.tipoMaterialMapper.toResponse(tipoMaterial);
    }

    public TipoMaterialResponseDTO criar(TipoMaterialRequestDTO requestDTO) {
        var tipoMaterial = this.tipoMaterialRepository.save(tipoMaterialMapper.toEntity(requestDTO));

        return this.tipoMaterialMapper.toResponse(tipoMaterial);
    }

    public TipoMaterialResponseDTO atualizar(Long id, TipoMaterialUpdateRequestDTO requestDTO) {
        var tipoMaterial = this.tipoMaterialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Tipo material não encontrado!"));

        this.tipoMaterialMapper.updateEntity(tipoMaterial, requestDTO);

        return this.tipoMaterialMapper.toResponse(this.tipoMaterialRepository.save(tipoMaterial));
    }

    public void remover(Long id) {
        var tipoMaterial = this.tipoMaterialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Tipo material não encontrado!"));

        this.tipoMaterialRepository.delete(tipoMaterial);
    }
}
