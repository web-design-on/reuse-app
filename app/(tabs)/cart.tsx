import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem('@reuse_cart');
      if (data) {
        setCartItems(JSON.parse(data));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error("Erro ao carregar carrinho", e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadCart();
    }
  }, [isFocused]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.poppinsBold}>Meu Carrinho</ThemedText>
        </View>

        <FlatList
          data={cartItems}
          contentContainerStyle={{ padding: 20 }}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: "/details",
                params: { ...item }
              })}
            >
              <ThemedView style={styles.cartItem}>
                <Image
                  source={{ uri: Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0] }}
                  style={styles.itemImage}
                />

                <ThemedView style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.title}</ThemedText>
                  <ThemedText style={styles.itemPrice}>R${item.price}</ThemedText>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              O seu carrinho está vazio.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  itemName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Poppins_700Bold',
    color: '#2ecc71',
    fontSize: 15,
  },
  itemLocation: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  poppinsBold: {
    fontFamily: 'Poppins_700Bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    opacity: 0.5,
    fontFamily: 'Poppins_400Regular'
  }
});