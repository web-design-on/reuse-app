import { ThemedText } from '@/components/themed-text';
import { useProducts } from '@/hooks/use-Products';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';


const { width } = Dimensions.get('window');

const categoryTranslations: Record<string, string> = {
  beauty: 'Beleza',
  fragrances: 'Fragrâncias',
  furniture: 'Móveis',
  groceries: 'Mercado'
} 

const translateCategory = (category: string) => {
  return categoryTranslations[category.toLowerCase()] || category;
};


export default function FavoritesScreen() {
  const [activeTab, setActiveTab] = useState<'categories' | 'saved'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedFavorites, setSavedFavorites] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  const { data: recentProducts, isLoading } = useProducts();

  const loadSavedItems = async () => {
    try {
      const data = await AsyncStorage.getItem('@reuse_favs');
      if (data) setSavedFavorites(JSON.parse(data));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isFocused) loadSavedItems(); }, [isFocused]);

  const handlePress = (item: any) => {
    router.push({
      pathname: "/details" as any,
      params: { 
        ...item, 
        images: Array.isArray(item.images) ? item.images.join(',') : (item.images || item.thumbnail),
        tags: Array.isArray(item.tags) ? item.tags.join(',') : item.tags,
        dimensions: typeof item.dimensions === 'object' ? JSON.stringify(item.dimensions) : item.dimensions
        }
    });
  };

  const categoriesList = Array.from(new Set((recentProducts || []).map((p: any) => p.category))).filter(Boolean);

  const dataToDisplay = activeTab === 'categories'
  ? (recentProducts || []).filter((p: any) => !selectedCategory || p.category === selectedCategory) 
  : savedFavorites;

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.headerTitle}>Lista de Desejos</ThemedText>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'categories' && styles.activeTabBorder]}
          onPress={() => setActiveTab('categories')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Categorias</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'saved' && styles.activeTabBorder]}
          onPress={() => setActiveTab('saved')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Favoritos</ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'categories' && !selectedCategory ? (
        <FlatList
          data={categoriesList as string[]}
          keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.categoryCard} 
                  onPress={() => setSelectedCategory(item)}
                >
                  <ThemedText style={styles.categoryText}>{translateCategory(item).toUpperCase()}</ThemedText>
                  <Ionicons name="chevron-forward" size={20} color="#4F40E2" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <ThemedText style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                  Nenhuma categoria encontrada.
                </ThemedText>
              }
            />
          ) : (
            <>
            {activeTab === 'categories' && selectedCategory && (
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="arrow-back" size={20} color="#4F40E2" />
                  <ThemedText style={styles.backButtonText}>Voltar para Categorias</ThemedText>
                </TouchableOpacity>
              )}
              <FlatList
                key={`grid-${activeTab}-${selectedCategory || 'saved'}`} 
                data={dataToDisplay}
                numColumns={2}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const imageUrl = Array.isArray(item.images) 
                    ? item.images[0] 
                    : (typeof item.images === 'string' ? item.images.split(',')[0] : item.thumbnail);
                  const title = item.title || item.name;

                  return (
                    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
                      <View style={styles.imageContainer}>
                        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
                      </View>
                      <ThemedText style={styles.productName} numberOfLines={1}>{title}</ThemedText>
                      <ThemedText type="defaultSemiBold">R$ {item.price}</ThemedText>
                    </TouchableOpacity>
                  )
                }}
                ListEmptyComponent={
                  <ThemedText style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                    Nenhum item encontrado.
                  </ThemedText>
                }
              />
            </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 60 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { marginBottom: 20, fontSize: 24, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTabBorder: { borderBottomWidth: 2, borderBottomColor: '#000' },
  tabText: { fontSize: 14, color: '#888' },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  card: { width: (width / 2) - 25 },
  imageContainer: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#f0f0f0', overflow: 'hidden', marginBottom: 8 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  productName: { fontSize: 14, marginBottom: 4 },
  categoryCard: {
    backgroundColor: 'rgba(79, 64, 226, 0.15)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F40E2'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 5
  },
  backButtonText: {
    color: '#4F40E2',
    fontWeight: '600'
  }
});