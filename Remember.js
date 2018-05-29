/*
********************************************************************************
#Estados da entidade:
Transient -> Quando faz o new
Managed   -> Quando já foi salvo
Detached  -> Quando já deu o em.close(), ela representa o BD mas não está sendo atualizada automaticamente.
Removed   -> Quando é deletada do database.

#Tipos Hibernate Mapping automático
<property name="hibernate.hbm2ddl.auto" value="update"/>
update - Qualquer alteração incremental nas classes de modelo também ocorrerão nas tabelas
create - Remove todos os dados do banco e crie as tabelas baseando-se nos seus modelos
create-drop - Deletar todos os dados ao terminarmos o EntityManagerFactory ou SessionFactory
none - Não faz nada
-->

********************************************************************************
@OneToMany - Cada usuário pode ter n permissoes *(Não pode salvar a permissão de outros usuários)*
#Um usuário pode ter N perissoes e não divide com ninguem
private List<Permissao> permissoes;

@ManyToMany - Muitos para muitos, muitos podem ter a mesma (Cria a tavela de relacionamento)
#Um usuário pode ter N perissoes e divide com os coleguinhas
private List<Categoria> categoria;

@OneToOne - Cada cliente pode ter apenas 1 conta
@JoinColumn(unique = true) // Condição cada usuario tem a sua conta
private Conta conta;

@ManyToOne - Muitas Movimentações tem uma conta
private Conta conta;

********************************************************************************
JDBC - Java
JPQL - Java Persistenve Query Language

********************************************************************************
# Select em um campo @ManyToMany
private static void ex03(EntityManager em) {
  Categoria categoria = new Categoria();
  categoria.setId(1);

  String jpql = "select m from Movimentacao m join m.categoria c where c = :pCategoria order by m.valor desc";
  Query query = em.createQuery(jpql);
  query.setParameter("pCategoria", categoria);

  ((List<Movimentacao>) query.getResultList()).stream().forEach(r -> System.out.println("Resultado -> " + r.getValor()));
}

* ********************************************************************************
#Relacionamento bidirecional
public class Movimentacao {
  @ManyToOne
  private Conta conta;
}

@Entity
public class Conta {
  @OneToMany(mappedBy = "conta")
  private List<Movimentacao> movimentacoes;
}
#mappedBy = "conta" <- Relacionamento forte para ajudar o JPA a entender o relacionamento com a outra tabela


* ********************************************************************************
Lazy Loading (Default) -> Traz as informações no GET
@OneToMany(mappedBy = "conta", fetch = FetchType.LAZY)
private List<Movimentacao> movimentacoes;

@OneToMany(mappedBy = "conta", fetch = FetchType.EAGER) - Se colocar no select não precisa desse
Eager Loading -> Traz tudo -> Transformando em Eager abaixo
// Lista todos os bancos, mesmo que ele não tenha movimentações
// Left join mostra o da esquerda mesmo que o da direita não exista
String jpql = "select distinct  c from Conta c left join fetch c.movimentacoes";
OBS: Precisa do distinct

* ********************************************************************************
# Força o retorno como Double.class
TypedQuery<Double> query = em.createQuery(jpql, Double.class);
List<Double> result = query.getResultList();

* ********************************************************************************
# Utilizando NamedQuery, são processados ao iniciar o hibernate
@Entity
@NamedQuery(query = "select avg(m.valor) from Movimentacao m group by m.data", name = "groupByData")
public class Movimentacao {}

private static void useNamedQuery(EntityManager em) {
    TypedQuery<Double> query = em.createNamedQuery("groupByData", Double.class);
    List<Double> result = query.getResultList();
    result.stream().forEach(m -> System.out.println("Media " + m));
}

* ********************************************************************************
#Altera o nome da tabela de relacionamento
@ManyToMany
@JoinTable(name="CATEGORIA_PRODUTO_REL")
private List<Categoria> categorias = new ArrayList<>();

* ********************************************************************************
#Diga não ao JPQL use CriteriaBuilder XD
#TOP
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

* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
*/