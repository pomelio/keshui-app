import { useEffect, useState, useContext } from 'react';
import { GraphQLContext } from '@/GraphQLContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { bytesToBase64 } from '@/utils';

import axios from 'axios';

const QUERY_ADS = `
query Openads($lang: String!) {
   lang_openads(lang: $lang) {
        photo
        version
        url
    }
}
`;

export const useOpenADS = (lang) => {

    const { client } = useContext(GraphQLContext);
    const [item, setItem] = useState(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const run = async () => {
            console.log(`----------load----ads------------------`)
            let key = '__OPEN_ADS__';
            let nitem = await AsyncStorage.getItem(key);
            if (nitem) {
                nitem = JSON.parse(nitem);
                setItem(nitem);
            }
            setLoading(true);
            try {
                let data = await client.query(QUERY_ADS, {lang});
                let vitem = data.lang_openads;
                if (!nitem || vitem && vitem.version !== nitem.version) {
                    let resp = await axios.get(vitem.photo, {
                        responseType: 'arraybuffer'
                    });
                    vitem.data = bytesToBase64(resp.data);
                    await AsyncStorage.setItem(key, JSON.stringify(vitem));
                    setItem(vitem);
                } else {
                    setItem(nitem);
                }


            } catch (err) {
                setError(err);

            } finally {
                setLoading(false);
            }
        };
        if (lang) {
            run();
        }
        

        return () => {
            setItem(null);
        };
    }, [lang]);




    return { item, error, loading };

}