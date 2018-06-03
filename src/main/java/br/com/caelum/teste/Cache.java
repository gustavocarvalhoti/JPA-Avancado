package br.com.caelum.teste;

import br.com.caelum.JpaConfigurator;
import br.com.caelum.model.Produto;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

public class Cache {

    public static void main(String[] args) {
        //primeiroNivel();
        segundoNivel();
    }

    private static void primeiroNivel() {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(JpaConfigurator.class);
        EntityManagerFactory emf = (EntityManagerFactory) ctx.getBean(EntityManagerFactory.class);

        EntityManager em01 = emf.createEntityManager();
        EntityManager em02 = emf.createEntityManager();

        Produto produto01 = em01.find(Produto.class, 1);
        Produto produto02 = em02.find(Produto.class, 1);

        System.out.println(produto01.getNome());
        System.out.println(produto02.getNome());
        em01.close();
        em02.close();
    }

    private static void segundoNivel() {
        // Como eu já configurei vai dar certo agora
        primeiroNivel();
    }
}