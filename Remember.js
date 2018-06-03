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
Lazy Loading (Default) -> Traz as informações no GET (N+1)
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
#EntityGraphs
Com esse recurso podemos dizer à JPA quais relacionamentos queremos trazer nas "queries".
#Mapeando
@NamedEntityGraphs({
    @NamedEntityGraph(name = "produtoComCategoria", attributeNodes = {@NamedAttributeNode("categorias")})
})
@Entity
public class Produto {}

#Utilizando
public List<Produto> getProdutos() {
    return em.createQuery("select distinct p from Produto p", Produto.class)
            .setHint("javax.persistence.loadgraph", em.getEntityGraph("produtoComCategoria"))
            .getResultList();
}

* ********************************************************************************
@DynamicUpdate - Permite que na query estejam apenas os campos que foram alterados
update Produto set nome=? where id=?

* ********************************************************************************
# Gerenciando conexões com Pool de conexão
É errado deixar uma conexão por cliente, precisamos aprender a administrar melhor as conexões
O caminho é deixar um conjunto de conexões abertas em algum lugar
Esse lugar é o Pool de Connection - Pool C3P0
#Configurando
public DataSource pullConexao() {
    try {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        dataSource.setJdbcUrl("jdbc:mysql://localhost/projeto_jpa");
        dataSource.setUser("root");
        dataSource.setPassword("padtec");

        // Serão criadas agora
        dataSource.setMinPoolSize(5);
        // Trabalha com as Threads simultaneas
        dataSource.setNumHelperThreads(5);
        // Seta o maximo de conexões
        dataSource.setMaxPoolSize(6);
        // Mata as conexões ociosas a cada 5 segundos
        dataSource.setIdleConnectionTestPeriod(5);

        return dataSource;
    } catch (Exception e) {
        e.printStackTrace();
    }

    return null;
}

#Configurando sem o Spring no persistence.xml
Hibernate 3
<property name="hibernate.connection.provider_class" value="org.hibernate.service.jdbc.connections.internal.C3P0ConnectionProvider">
<property name="hibernate.c3p0.min_size" value="5" />
<property name="hibernate.c3p0.max_size" value="20" />
<property name="hibernate.c3p0.timeout" value="180" />
Hibernate 4
<property name="hibernate.connection.provider_class" value="org.hibernate.c3p0.internal.C3P0ConnectionProvider">
<property name="hibernate.c3p0.min_size" value="5" />
<property name="hibernate.c3p0.max_size" value="20" />
<property name="hibernate.c3p0.timeout" value="180" />

pom.xml
<dependency>
    <groupId>c3p0</groupId>
    <artifactId>c3p0</artifactId>
    <version>x.x.x</version>
</dependency>
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-c3p0</artifactId>
    <version>${hibernate.version}</version>
</dependency>

* ********************************************************************************
#Lock pessimista não é legal - Trava a entidade até terminar de usar
Produto produto = manager.find(Produto.class, 1, LockModeType.PESSIMISTIC_READ);
#Lock otimista (Top)
Colocar o atributo abaixo, ai ele criar um versionamento, ai se enviar uma versão antiga ele da erro
@Version
private int versao;

* ********************************************************************************
*  Melhorando o desempenho com Cache de primeiro nivel, quarda os finds aqui
O Cache de primeiro nivel é por EntityManager, cada um guarda os seus finds
# Criando um cache global (O de segundo nivel, compartilhado por todos, tomar cuidado)
Posso colocar por entidade
@Entity
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@DynamicUpdate
public class Produto {}
Ou por atributo
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
private List<Categoria> categorias = new ArrayList<>();

READ_ONLY deve ser utilizada quando uma entidade não deve ser modificada.
READ_WRITE deve ser utilizada quando uma entidade pode ser modificada e há grandes chances que modificações em seu estado ocorram simultaneamente. Essa estratégia é a que mais consome recursos.
NONSTRICT_READ_WRITE deve ser utilizada quando uma entidade pode ser modificada, mas é incomum que as alterações ocorram ao mesmo tempo. Ela consome menos recursos que a estratégia READ_WRITE e é ideal quando não há problemas de dados inconsistentes serem lidos quando ocorrem alterações simultâneas.
TRANSACTIONAL deve ser utilizada em ambientes JTA, como por exemplo em servidores de aplicação. Como utilizamos Tomcat com Spring (sem JTA) essa opção não funcionará.

* ********************************************************************************
# Query cache (Bom para filtros de tela) - ehcache.xml
public List<Produto> getProdutosCacheable(String nome, Integer categoriaId, Integer lojaId) {
    CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
    CriteriaQuery<Produto> query = criteriaBuilder.createQuery(Produto.class);
    query.from(Produto.class);

    TypedQuery<Produto> typedQuery = em.createQuery(query);
    typedQuery.setHint("org.hibernate.cacheable", "true");
    return typedQuery.getResultList();
}
# Setando o parametro
props.setProperty("hibernate.cache.use_query_cache", "true");

* ********************************************************************************
# ehcache.xml - Valida o numero de querys em cache
<?xml version="1.0" encoding="UTF-8"?>
<ehcache>
    <diskStore path="java.io.tmpdir"/>
    <defaultCache
            maxElementsInMemory="2"
            eternal="true"
            overflowToDisk="false"/>
</ehcache>

Da para colocar por entidade tb
<cache name="br.com.caelum.model.Produto"
    maxElementsInMemory="300"
    eternal="true"
    overflowToDisk="false"
/>
http://www.ehcache.org/documentation/2.8/configuration/configuration.html

* ********************************************************************************
# Caçando seus gargalos com o Hibernate Statistics
// Statistics
props.setProperty("hibernate.generate_statistics", "true");
@Bean
public Statistics statistics(EntityManagerFactory emf) {
    SessionFactory factory = emf.unwrap(SessionFactory.class);
    return factory.getStatistics();
}
# HTML
<table class="table table-striped">
    <thead>
        <tr>
            <th>Hit - Tinha no cache</th>
            <th>Miss - Buscou no banco</th>
            <th>Conexões</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>${statistics.queryCacheHitCount}</td>
            <td>${statistics.queryCacheMissCount}</td>
            <td>${statistics.connectCount}</td>
        </tr>
    </tbody>
</table>

* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
* ********************************************************************************
*/