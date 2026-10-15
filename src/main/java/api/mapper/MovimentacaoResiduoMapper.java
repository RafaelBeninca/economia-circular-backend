package api.mapper;

import api.dto.*;
import api.model.Material;
import api.model.MovimentacaoResiduo;
import api.model.TipoMaterial;
import org.springframework.stereotype.Component;

import java.util.List;

// CAMADA: Mapper
// RESPONSABILIDADE: converter MovimentacaoResiduoRequestDTO em MovimentacaoResiduo, e MovimentacaoResiduo em MovimentacaoResiduoResponseDTO
// SITUAÇÃO: implementada
@Component
public class MovimentacaoResiduoMapper {

    private final MaterialMapper materialMapper;

    public MovimentacaoResiduoMapper(MaterialMapper materialMapper) {
        this.materialMapper = materialMapper;
    }

    public MovimentacaoResiduo toEntity(MovimentacaoResiduoRequestDTO dto, Material material) {
        var movimentacaoResiduo = new MovimentacaoResiduo(dto.movimentacaoResiduo(), dto.quantidade(), dto.descricao());
        movimentacaoResiduo.setMaterial(material);

        return movimentacaoResiduo;
    }

    public MovimentacaoResiduoResponseDTO toResponse(MovimentacaoResiduo movimentacaoResiduo) {
        return new MovimentacaoResiduoResponseDTO(movimentacaoResiduo.getId(), this.materialMapper.toResponse(movimentacaoResiduo.getMaterial()), movimentacaoResiduo.getMovimentacaoResiduo(), movimentacaoResiduo.getQuantidade(), movimentacaoResiduo.getDescricao(), movimentacaoResiduo.getCriadoEm());
    }

    public List<MovimentacaoResiduoResponseDTO> toResponseList(List<MovimentacaoResiduo> movimentacaoResiduos) {
        return movimentacaoResiduos.stream().map(this::toResponse).toList();
    }

}
