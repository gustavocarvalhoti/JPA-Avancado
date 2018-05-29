package br.com.caelum.dao;

import br.com.caelum.model.Loja;
import br.com.caelum.model.Produto;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ProdutoDao {

    @PersistenceContext
    private EntityManager em;

    public List<Produto> getProdutos() {
        return em.createQuery("from Produto", Produto.class).getResultList();
    }

    public Produto getProduto(Integer id) {
        Produto produto = em.find(Produto.class, id);
        return produto;
    }

    public List<Produto> getProdutos(String nome, Integer categoriaId, Integer lojaId) {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Produto> query = criteriaBuilder.createQuery(Produto.class);

        // Paga os atributos do Produto
        Root<Produto> root = query.from(Produto.class);
        Path<String> nomePath = root.<String>get("nome");
        Path<Integer> lojaPath = root.<Loja>get("loja").<Integer>get("id");
        Path<Integer> categoriaPath = root.join("categorias").<Integer>get("id");

        // Os filtros
        List<Predicate> predicates = new ArrayList<>();
        if (!nome.isEmpty())
            predicates.add(criteriaBuilder.like(nomePath, nome));
        if (categoriaId != null)
            predicates.add(criteriaBuilder.equal(categoriaPath, categoriaId));
        if (lojaId != null)
            predicates.add(criteriaBuilder.equal(lojaPath, lojaId));

        // Chama o where e passa a lista para ele
        query.where((Predicate[]) predicates.toArray(new Predicate[0]));

        TypedQuery<Produto> typedQuery = em.createQuery(query);
        return typedQuery.getResultList();
    }

    // Utilizando CriteriaBuilder
    public List<Produto> getProdutosV1(String nome, Integer categoriaId, Integer lojaId) {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Produto> query = criteriaBuilder.createQuery(Produto.class);
        query.from(Produto.class);

        TypedQuery<Produto> typedQuery = em.createQuery(query);
        return typedQuery.getResultList();
    }

    // Não é muito legal esse
    public List<Produto> getProdutosJPQL(String produtoNome, Integer categoriaId, Integer lojaId) {
        StringBuilder queryJPQL = new StringBuilder("select p from Produto p ");

        if (categoriaId != null) {
            queryJPQL.append("join fetch p.categorias cat ");
            queryJPQL.append("where cat.id = :pCategoriaId ");
        } else {
            queryJPQL.append("where 1 = 1 ");
        }

        if (lojaId != null)
            queryJPQL.append("and p.loja.id = :pLojaId ");

        if (!produtoNome.isEmpty())
            queryJPQL.append("and p.nome like :pProdutoNome");

        TypedQuery<Produto> typedQuery = em.createQuery(queryJPQL.toString(), Produto.class);
        if (categoriaId != null)
            typedQuery.setParameter("pCategoriaId", categoriaId);
        if (!produtoNome.isEmpty())
            typedQuery.setParameter("pProdutoNome", "%" + produtoNome + "%");
        if (lojaId != null)
            typedQuery.setParameter("pLojaId", lojaId);

        return typedQuery.getResultList();
    }

    public void insere(Produto produto) {
        if (produto.getId() == null)
            em.persist(produto);
        else
            em.merge(produto);
    }

}
