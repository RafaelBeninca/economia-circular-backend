package api.service;

import api.dto.MaterialComSaldoResponseDTO;
import api.dto.MaterialRequestDTO;
import api.dto.MaterialUpdateRequestDTO;
import api.mapper.MaterialMapper;
import api.repository.MaterialRepository;
import api.repository.MovimentacaoResiduoRepository;
import api.repository.TipoMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// CAMADA: Service
// RESPONSABILIDADE: cadastrar, consultar e editar materiais, sempre devolvendo o saldo atual junto.
// REGRAS:
//         R3: Não podem existir materiais duplicados (com mesmo nome e unidade de medida). Vale ao cadastrar e ao editar o nome
// ROTAS ATENDIDAS: GET /materiais, GET /materiais/{id}, POST /materiais, PUT /materiais/{id} e DELETE /materiais/{id}
// SITUAÇÃO: implementada.
@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;
    private final TipoMaterialRepository tipoMaterialRepository;
    // O saldo de um material é a soma das movimentações dele, que vivem no outro repositório.
    private final MovimentacaoResiduoRepository movimentacaoResiduoRepository;

    public MaterialService(MaterialRepository materialRepository, MaterialMapper materialMapper, TipoMaterialRepository tipoMaterialRepository, MovimentacaoResiduoRepository movimentacaoResiduoRepository) {
        this.materialRepository = materialRepository;
        this.materialMapper = materialMapper;
        this.tipoMaterialRepository = tipoMaterialRepository;
        this.movimentacaoResiduoRepository = movimentacaoResiduoRepository;
    }

    // Duas consultas explícitas para buscar materiais e calcular os saldos: uma traz os
    // materiais, a outra traz todos os saldos de uma vez. Relacionamentos carregados pelo
    // Hibernate podem gerar consultas adicionais; o agrupamento evita um SUM por material.
    //
    // O caminho ingênuo seria somar o saldo dentro do laço, chamando somarQuantidadePorMaterial
    // para cada material -- o que daria 1 + N consultas (o problema N+1). Com
    // spring.jpa.show-sql=true, a diferença aparece no console.
    public List<MaterialComSaldoResponseDTO> listar() {
        var saldosPorMaterialId = this.movimentacaoResiduoRepository.somarQuantidadeDeTodosOsMateriais()
                .stream()
                .collect(Collectors.toMap(MovimentacaoResiduoRepository.SaldoPorMaterial::getMaterialId, MovimentacaoResiduoRepository.SaldoPorMaterial::getSaldo));

        return this.materialMapper.toResponseComSaldoList(this.materialRepository.findAll(), saldosPorMaterialId);
    }

    public MaterialComSaldoResponseDTO listarPorId(Long id) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        return this.materialMapper.toResponseComSaldo(material, this.saldoDe(id));
    }

    public MaterialComSaldoResponseDTO criar(MaterialRequestDTO requestDTO) {
        var tipoMaterial = this.tipoMaterialRepository.findById(requestDTO.tipoMaterialId()).orElseThrow(() -> new RecursoNaoEncontradoException("Tipo Material não encontrado!"));

        if (this.materialRepository.existsByNomeIgnoreCaseAndUnidadeMedida(requestDTO.nome().trim(), requestDTO.unidadeMedida())) {
            throw new RegraDeNegocioException("Já existe um material com esse nome e unidade de medida!");
        }

        var material = this.materialRepository.save(materialMapper.toEntity(requestDTO, tipoMaterial));

        // Material recém-cadastrado nunca tem movimentação, então o saldo é zero. Não vale
        // uma consulta ao banco para descobrir isso.
        return this.materialMapper.toResponseComSaldo(material, 0.0);
    }

    public MaterialComSaldoResponseDTO atualizar(Long id, MaterialUpdateRequestDTO requestDTO) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        // R3 no editar: a unidade de medida não muda, então a checagem usa a do próprio material.
        // O "AndIdNot" libera o material de colidir com ele mesmo quando só o preço muda.
        if (this.materialRepository.existsByNomeIgnoreCaseAndUnidadeMedidaAndIdNot(requestDTO.nome().trim(), material.getUnidadeMedida(), id)) {
            throw new RegraDeNegocioException("Já existe um material com esse nome e unidade de medida!");
        }

        this.materialMapper.updateEntity(material, requestDTO);

        return this.materialMapper.toResponseComSaldo(this.materialRepository.save(material), this.saldoDe(id));
    }

    public void remover(Long id) {
        var material = this.materialRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado!"));

        this.materialRepository.delete(material);
    }

    // O saldo de um material só: aqui a consulta por id é a mais direta, porque não há
    // lista para percorrer. A query devolve 0 quando não existe movimentação (COALESCE).
    private Double saldoDe(Long materialId) {
        return this.movimentacaoResiduoRepository.somarQuantidadePorMaterial(materialId);
    }
}
