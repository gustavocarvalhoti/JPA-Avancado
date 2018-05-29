
package br.com.caelum.model;

import org.hibernate.validator.constraints.NotEmpty;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty
    private String nome;

    @NotEmpty
    private String linkDaFoto;

    @NotEmpty
    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Min(20)
    private double preco;

    @ManyToMany
    //@JoinTable(name = "CATEGORIA_PRODUTO_REL")
    private List<Categoria> categorias = new ArrayList<>();

    @Valid
    @ManyToOne
    private Loja loja;

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    //Método auxiliar para associar categorias com o produto
    public void addCategorias(Categoria... categorias) {
        for (Categoria categoria : categorias)
            this.categorias.add(categoria);
    }

    public String getLinkDaFoto() {
        return linkDaFoto;
    }

    public double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

    public void setLinkDaFoto(String linkDaFoto) {
        this.linkDaFoto = linkDaFoto;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setLoja(Loja loja) {
        this.loja = loja;
    }

    public Loja getLoja() {
        return loja;
    }

    public List<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<Categoria> categorias) {
        this.categorias = categorias;
    }
}