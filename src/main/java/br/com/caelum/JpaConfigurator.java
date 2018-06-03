package br.com.caelum;

import com.mchange.v2.c3p0.ComboPooledDataSource;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableTransactionManagement
public class JpaConfigurator {

    @Bean
    public DataSource getDataSource() {
        //return umaConexaoPorUsuario();
        return pullConexao();
    }

    public DriverManagerDataSource umaConexaoPorUsuario() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();

        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost/projeto_jpa");
        dataSource.setUsername("root");
        dataSource.setPassword("padtec");

        return dataSource;
    }

    public DataSource pullConexao() {
        try {
            ComboPooledDataSource dataSource = new ComboPooledDataSource();
            dataSource.setDriverClass("com.mysql.jdbc.Driver");
            dataSource.setJdbcUrl("jdbc:mysql://localhost/projeto_jpa");
            dataSource.setUser("root");
            dataSource.setPassword("teste");

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

    @Bean
    public LocalContainerEntityManagerFactoryBean getEntityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean entityManagerFactory = new LocalContainerEntityManagerFactoryBean();

        entityManagerFactory.setPackagesToScan("br.com.caelum");
        entityManagerFactory.setDataSource(dataSource);

        entityManagerFactory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        Properties props = new Properties();

        props.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQL5InnoDBDialect");
        props.setProperty("hibernate.show_sql", "true");
        props.setProperty("hibernate.hbm2ddl.auto", "create-drop");
        /*
        update - Qualquer alteração incremental nas classes de modelo também ocorrerão nas tabelas
        create - Remove todos os dados do banco e crie as tabelas baseando-se nos seus modelos
        create-drop - Deletar todos os dados ao terminarmos o EntityManagerFactory ou SessionFactory
        none - Não faz nada
        */
        // Ativa o cache de segundo nivel
        props.setProperty("hibernate.cache.use_second_level_cache", "true");
        props.setProperty("hibernate.cache.region.factory_class", "org.hibernate.cache.ehcache.SingletonEhCacheRegionFactory");
        /*
        No Persistence.xml utilize isso:
        <property name="hibernate.cache.use_second_level_cache" value="true" />
        <property name="hibernate.cache.region.factory_class" value="org.hibernate.cache.ehcache.SingletonEhCacheRegionFactory" />
         */
        // Setando o cache query
        props.setProperty("hibernate.cache.use_query_cache", "true");
        // Statistics
        props.setProperty("hibernate.generate_statistics", "true");

        entityManagerFactory.setJpaProperties(props);
        return entityManagerFactory;
    }

    @Bean
    public JpaTransactionManager getTransactionManager(EntityManagerFactory emf) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(emf);

        return transactionManager;
    }

    @Bean
    public Statistics statistics(EntityManagerFactory emf) {
        SessionFactory factory = emf.unwrap(SessionFactory.class);
        return factory.getStatistics();
    }
}