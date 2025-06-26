import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';

// <<< CONFIRME QUE ESTA É A SUA URL DO NGROK!
const BASE_URL_API = ' https://6318-200-215-225-245.ngrok-free.app'; 

function AtletasScreen() {
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Adiciona um pequeno atraso para tornar o indicador de carregamento visível
    const timer = setTimeout(() => { 
        setLoading(true); // Garante que o loading está true antes de começar
        fetchAtletas();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchAtletas = async () => {
    try {
      const url = `${BASE_URL_API}/atletas`; 
      console.log("Tentando buscar atletas de:", url);

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET', // <--- ADICIONE ESTA LINHA EXPLICITAMENTE
        signal: controller.signal
      });
      clearTimeout(id);
      
      console.log("Resposta recebida do servidor (status):", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta HTTP:", response.status, errorText);
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Dados recebidos (JSON):", data);

      if (Array.isArray(data)) {
        setAtletas(data);
      } else {
        console.error("Dados recebidos não são um array:", data);
        setError("Formato de dados inválido recebido do servidor.");
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.error("Erro geral na busca de atletas: Requisição excedeu o tempo limite.");
        setError("Não foi possível carregar os atletas: Requisição excedeu o tempo limite.");
      } else {
        console.error("Erro geral na busca de atletas:", e.message);
        setError("Não foi possível carregar os atletas: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando atletas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (atletas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lista de Atletas</Text>
        <Text style={styles.noDataText}>Nenhum atleta encontrado no momento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Lista de Atletas</Text>
      <FlatList
        data={atletas}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>Posição: {item.posicao_principal}</Text>
            <Text>Nível: {item.nivel}</Text>
            <Text style={styles.atributosDetalhados}>
              V:{item.velocidade || 0} F:{item.fisico || 0} A:{item.arremesso || 0} D:{item.defesa || 0} Dr:{item.drible || 0}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignSelf: 'stretch',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0056b3',
  },
  atributosDetalhados: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  }
});

export { AtletasScreen };