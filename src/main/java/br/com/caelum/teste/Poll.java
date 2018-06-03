package br.com.caelum.teste;

import br.com.caelum.JpaConfigurator;
import com.mchange.v2.c3p0.ComboPooledDataSource;

import java.sql.Connection;
import java.sql.SQLException;

public class Poll {

    public static void main(String[] args) {
        ComboPooledDataSource dataSource = (ComboPooledDataSource) new JpaConfigurator().getDataSource();
        try {
            for (int i = 0; i < 10; i++) {
                Connection con1 = dataSource.getConnection();
                System.out.println("***************************************");
                // Conections ocupadas
                System.out.println("Ocupadas: " + dataSource.getNumBusyConnections());
                // Conections paradas
                System.out.println("Livres: " + dataSource.getNumIdleConnections());
                // Quando não tem nenhuma disponivel ele cria outra
                // Ele fica aguardando liberar uma para continuar
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
