package br.com.caelum;

import java.util.Properties;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class JpaConfigurator {

    @Bean
    public DataSource getDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();

        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost/projeto_jpa");
        dataSource.setUsername("root");
        dataSource.setPassword("padtec");

        return dataSource;
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

        entityManagerFactory.setJpaProperties(props);
        return entityManagerFactory;
    }

    @Bean
    public JpaTransactionManager getTransactionManager(EntityManagerFactory emf) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(emf);

        return transactionManager;
    }

}
