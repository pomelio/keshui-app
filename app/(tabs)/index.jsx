import React, { useContext, useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import ArticleItem from '@/components/ArticleItem';
import { useArticles } from '@/hooks/useArticles';
import { AppContext } from '@/Context';
export { ErrorBoundary } from 'expo-router';

export default function NewsList(props) {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  console.log(`--------NewsList--params-${JSON.stringify(params)}-------------`);

  const { session } = useContext(AppContext);
  const router = useRouter();

  let lang = session.lang;
 
  console.log(`--------NewsList-${lang}-------------`);
  let { loading, noMore, error, articles, refresh, next } = useArticles(lang);


  const handleRefresh = useCallback(async () => {
    if (!loading) {
      refresh();
    }
  }, [loading]);

  const handleLoadMore = useCallback(() => {
    console.log(`-----handleLoadMore-------------`)
    if (!loading) {
      console.log(`-----handleLoadMore--next-----------`)

      next();
    }


  }, [loading]);

  const handlePressItem = (item) => {
    router.push(`/article/${item._id}`);
  };

  const renderItem = useCallback(({ item }) => {
    return <TouchableOpacity key={`item_${item.id}_lang_${session.lang}`} onPress={() => handlePressItem(item)}>
      <ArticleItem article={item} session={session} />
    </TouchableOpacity>
r
  }, [session]);


  useEffect(() => {

    navigation.setOptions({
      title: 'EnLearn',
    });

  }, []);
  return (

    <FlatList
      removeClippedSubviews={true}
      data={articles}
      renderItem={renderItem}
      keyExtractor={item => item._id}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={2}
      //contentContainerStyle={{ padding: 16 }}
      ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
    />
  );
};