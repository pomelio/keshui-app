
import React, { useContext } from 'react';
import { Card } from '@/components/ui/card';
import {Image} from '@/components/ui/image';
import {Spinner} from '@/components/ui/spinner';
import {Text} from '@/components/ui/text';
import {
    Button,
    ButtonText,
} from "@/components/ui/button";

import { useRouter } from 'expo-router';

import { AppContext } from '@/Context';
import { useOpenADS } from '@/hooks/useOpenADS';


export default function OpenADS(props) {
    
    const router = useRouter();
    
    const { session, setSession } = useContext(AppContext);

    let lang = session.lang;
    const {item} = useOpenADS(lang);

    if (!item) {
        return <Card className="rounded-lg m-1 h-full flex justify-center items-center" >
                    <Spinner size="large" />
                    <Text size="md">Please Wait</Text>
                </Card>;
    }

    return (
        <Card className="p-5 rounded-lg max-w-[360px] m-3">
            <Image
                source={{
                    uri: 'data:image/png;base64,' + item.data
                }}
                alt="ads"
                className="my-6 w-full h-5/6 rounded-md"
            />
            <Button className="p-2" onPress={
                    () => {
                        
                        let nsession = Object.assign(session, {openADS: true});
                        setSession(nsession);
                        router.replace({pathname: "/", params:{openADS: true}});
                    }
                }>
                <ButtonText className="text-sm ml-2" >Skip</ButtonText>
            </Button>

        </Card>
    );
}