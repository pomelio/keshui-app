import { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { GraphQLContext } from '@/GraphQLContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '@/Context';
import { saveAudioToLocalFS, Stack } from '@/utils';


const QUERY_ARTICLE = `
query Article($id: ID!)  {
    chinese_article(id: $id) {
        _id
        pubDate
        nextID
        summary {
            Chinese
        }
        photo {
            data
            format
            width
            height
        }
        audios {
            seq
            contentType
            data
        }
    }
    
}

`;


const _ADUIO_TYPES = {
    'audio/wav': 'wav',
    'audio/mp3': 'mp3'
};

async function initArticle(narticle) {
    let key = `article_${narticle._id}}`;
    let audios = narticle.audios;
    let naudios = [];
    for (let i = 0; i < audios.length; i++) {
        let a = audios[i];
        
        let ext = _ADUIO_TYPES[a.contentType];
        if (!ext) {
            throw new Error(`audio contentType: ${a.contentType} is not support.`)
        }
        let url = await saveAudioToLocalFS(a.data, `${key}_${i}`, ext);
        let audio = {
            url
        };
        naudios.push(audio);
    }
    narticle.audios = naudios;

}



export const useArticle = (id) => {

    const { session } = useContext(AppContext);
    const { client } = useContext(GraphQLContext);
    const [article, setArticle] = useState(null);
    const [nextArticle, setNextArticle] = useState(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const stack = useRef(new Stack());

    useEffect(() => {
        const loadArticle = async () => {
            let key = `article_${id}`;
            let narticle = await AsyncStorage.getItem(key);
            if (narticle) {
                narticle = JSON.parse(narticle);

                setArticle(narticle);

            } else {
                setLoading(true);
                try {
                    let data = await client.query(QUERY_ARTICLE, { id });
                    data.article = data.chinese_article;
                    narticle = Object.assign({}, data.article);
                    await initArticle(narticle);
                    console.log(`----------loadArticle------id-----${id}------------`);

                    setArticle(narticle);

                } catch (err) {
                    setError(err);

                } finally {
                    setLoading(false);
                }
            }

        };

        loadArticle();

    }, [id]);

    const fetchNext = useCallback(async () => {
        if (!article) {
            return;
        }
        setLoading(true);
        try {
            console.log(`-------next-------id--${article.nextID}-------`);
            let key = `article_${article.nextID}`;
            let narticle = await AsyncStorage.getItem(key);
            if (narticle) {
                narticle = JSON.parse(narticle);
                setNextArticle(narticle);

            } else {
                let data = await client.query(QUERY_ARTICLE, { id: article.nextID });
                data.article = data.chinese_article;
                let narticle = data.article;
                await initArticle(narticle);
                setNextArticle(narticle);
            }

        } catch (err) {
            setError(err);

        } finally {
            setLoading(false);

        }

    }, [article]);


    const next = useCallback(() => {

        stack.current.push(article);
        setLoading(true);
        try {
            if (nextArticle) {
                setArticle(nextArticle);
            }


        } catch (err) {
            setError(err);

        } finally {
            setLoading(false);
        }

    }, [nextArticle]);

    const prev = useCallback(() => {
        let stk = stack.current;
        if (stk.isEmpty()) {
            return;
        }
        let art = stk.pop();
        setArticle(art);
    }, []);


    return { article, fetchNext, next, prev, error, loading };

}