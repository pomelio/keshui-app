import { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/Context';
import { GraphQLContext } from '@/GraphQLContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUERY_REFRESH_ID = `
query recentID {
    recentID
}
`;


const QUERY_ARTICLES = `
query Articles($skip: Int!, $limit: Int!) {
    chinese_articles(skip: $skip, limit: $limit) {
        _id
        pubDate
        status
        summary {
            Chinese
        }
        photo {
            data
            format
            width
            height
        }
    }
}
`;

const LIMIT = 10;

export const useArticles = (lang) => {

    const { session } = useContext(AppContext);
    const { client } = useContext(GraphQLContext);

    const [articles, setArticles] = useState([]);

    const [noMore, setNoMore] = useState(false);
    const [skip, setSkip] = useState(0);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

   

    //console.log(`+useArticles++lang:${lang}`);

    const refresh = useCallback(async () => {
        
        setLoading(true);

        try {

            //console.log(`------useArticles-articles len-${articles.length}-queryLang:${queryLang}-lang:${lang}`);
            

            if (articles.length === 0) {
                const articles = await AsyncStorage.getItem('articles');
                if (articles) {
                    //console.log(`---20---useArticles-articles---`);
                    try {
                        let narticles = JSON.parse(articles);
                        //console.log(`---22---useArticles-articles len-${articles.length}--`);
                        setArticles(narticles);
                    } catch (err) {
                        console.log(`---24---useArticles-articles ${err.message}--`);
                    }
                }
            } else {
                let data = await client.query(QUERY_REFRESH_ID, {});

                if (articles.length > 0 && articles[0]._id === data.recentID) {
                    return;
                }
            }

            //console.log(`+first+10+lang:${lang}`);

            setNoMore(false);
            setSkip(0);

            let data = await client.query(QUERY_ARTICLES, {skip: 0, limit: LIMIT });
            data.articles = data.chinese_articles;
            if (data.articles.length < LIMIT) {
                setNoMore(true);
            } else {
                setSkip(LIMIT);
            }
            let narticles = data.articles.filter(a => a.status === 'ok');

            setArticles(narticles);
            await AsyncStorage.setItem('articles', JSON.stringify(narticles));
        } catch (err) {
            //console.log(`+erro+useArticles++refresh++20+lang:${lang}`);
            setError(err);

        } finally {
            setLoading(false);
        }
    }, [lang, articles]);

    const next = useCallback(async () => {
        if (!lang) {
            return;
        }
        //console.log(`+next+run+useArticles+lang:${lang}--${skip}`);
        setLoading(true);
        try {
            //console.log(`+next+20+lang:${lang}**${skip}`);
            
            let data = await client.query(QUERY_ARTICLES, { skip, limit: LIMIT });
            //console.log(`+next+30+`);
            data.articles = data.chinese_articles;
            if (data.articles.length < LIMIT) {
                setNoMore(true);
            } else {
                //console.log(`+next+40+skip:${lang}**${skip + LIMIT}`);
                setSkip(skip + LIMIT)
            }
            let narticles = data.articles.filter(a => a.status === 'ok');
            narticles = [...articles, ...narticles,];
            setArticles(narticles);
            await AsyncStorage.setItem('articles', JSON.stringify(narticles));
        } catch (err) {
            setError(err);

        } finally {
            //console.log(`++finally++loading:false`);
            setLoading(false);
        }

    }, [lang, skip, articles]);

    useEffect(() => {
        //console.log(`+-------+useArticles++refresh`);
        refresh();
    }, [lang])


    return { articles, noMore, refresh, next, loading, error };

}