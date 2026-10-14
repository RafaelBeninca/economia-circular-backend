package api.service;

import api.dto.MovimentacaoResiduoRequestDTO;
import api.dto.MovimentacaoResiduoResponseDTO;
import api.enums.TipoMovimentacaoResiduo;
import api.mapper.MovimentacaoResiduoMapper;
import api.repository.MaterialRepository;
import api.repository.MovimentacaoResiduoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar e consultar movimentações de resíduos.
// REGRAS:
//         R1: A quantidade de uma movimentação de saida não pode ser maior que o a soma das quantidades totais das movimentações
//             daquele material
//         R2: Movimentações com o tipo 'SAIDA' devem possuir quantidade negativa, e movimentações do tipo 'ENTRADA' devem possuir
//             quantidade positiva
//
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

        var tipo = requestDTO.movimentacaoResiduo();
        var qtd = requestDTO.quantidade();
        if ((tipo == TipoMovimentacaoResiduo.SAIDA && qtd >= 0) || (tipo == TipoMovimentacaoResiduo.ENTRADA && qtd <= 0)) {
            throw new RegraDeNegocioException("Saída deve ter quantidade negativa e entrada, positiva!");
        }

        if (requestDTO.movimentacaoResiduo() == TipoMovimentacaoResiduo.SAIDA) {
            double saldo = this.movimentacaoResiduoRepository.somarQuantidadePorMaterial(material.getId());
            double saldoAposSaida = saldo + requestDTO.quantidade();

            if (saldoAposSaida < 0) {
                throw new RegraDeNegocioException("Saída de " + Math.abs(requestDTO.quantidade())
                        + " excede o saldo disponível de " + saldo + " do material!");
            }
        }

        var movimentacaoResiduo = this.movimentacaoResiduoRepository.save(movimentacaoResiduoMapper.toEntity(requestDTO, material));

        return this.movimentacaoResiduoMapper.toResponse(movimentacaoResiduo);
    }
}
