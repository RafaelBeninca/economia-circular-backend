package api.service;

import api.dto.MovimentacaoResiduoRequestDTO;
import api.dto.MovimentacaoResiduoResponseDTO;
import api.mapper.MovimentacaoResiduoMapper;
import api.repository.MaterialRepository;
import api.repository.MovimentacaoResiduoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar e consultar movimentações de resíduos.
// REGRAS: Não se aplicam
// ROTAS ATENDIDAS: GET /movimentacoesResiduos, GET /movimentacoesResiduos/{id} e POST /movimentacoesResiduos (/movimentacoesResiduos em docs/contrato-da-api.md)
// SITUAÇÃO: implementada
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
