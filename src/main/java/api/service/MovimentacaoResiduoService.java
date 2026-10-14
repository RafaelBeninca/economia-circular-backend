package api.service;

import api.dto.MaterialRequestDTO;
import api.dto.MaterialResponseDTO;
import api.dto.MovimentacaoResiduoRequestDTO;
import api.dto.MovimentacaoResiduoResponseDTO;
import api.mapper.MaterialMapper;
import api.mapper.MovimentacaoResiduoMapper;
import api.repository.MaterialRepository;
import api.repository.MovimentacaoResiduoRepository;
import api.repository.TipoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovimentacaoResiduoService {

    private final MovimentacaoResiduoRepository movimentacaoResiduoRepository;
    private final MovimentacaoResiduoMapper movimentacaoResiduoMapper;
    private final MaterialRepository materialRepository;

    public MovimentacaoResiduoService(MovimentacaoResiduoRepository movimentacaoResiduoRepository, MovimentacaoResiduoMapper movimentacaoResiduoMapper, MaterialRepository materialRepository) {
        this.movimentacaoResiduoRepository = movimentacaoResiduoRepository;
        this.movimentacaoResiduoMapper = movimentacaoResiduoMapper;
        this.materialRepository = materialRepository;
    }

    public List<MovimentacaoResiduoResponseDTO> listar() {
        return movimentacaoResiduoMapper.toResponseList(this.movimentacaoResiduoRepository.findAll());
    }

    public MovimentacaoResiduoResponseDTO listarPorId(Long id) {
        var movimentacaoResiduo = this.movimentacaoResiduoRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Movimentação de resíduo não encontrada!"));

        return this.movimentacaoResiduoMapper.toResponse(movimentacaoResiduo);
    }

    public MovimentacaoResiduoResponseDTO criar(MovimentacaoResiduoRequestDTO requestDTO) {
        var material = this.materialRepository.findById(requestDTO.materialId()).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        var movimentacaoResiduo = this.movimentacaoResiduoRepository.save(movimentacaoResiduoMapper.toEntity(requestDTO, material));

        return this.movimentacaoResiduoMapper.toResponse(movimentacaoResiduo);
    }
}
