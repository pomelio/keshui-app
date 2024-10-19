import React, { useState, useContext, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '@/Context';

export default function PlaySpeed(props) {

    const [selectedValue, setSelectedValue] = useState(0);
    const { setSession, session } = useContext(AppContext);

    const handleSelection = async (value) => {
        
        setSelectedValue(value);
        let nsession = Object.assign(session, {autoplay: value});
        setSession(nsession);
        await AsyncStorage.setItem('autoplay', "" + value);
    };

    useEffect(() => {
        if ('autoplay' in session) {
            setSelectedValue(session.autoplay);
        }
    }, [session])

    return (
        <Card className="rounded-lg m-1 h-full flex justify-center items-center" >
            <Slider
                className="w-2/3"
                minValue={0}
                maxValue={30}
                defaultValue={selectedValue}
                value={selectedValue}
                size="lg"
                orientation="horizontal"
                isDisabled={false}
                isReversed={false}
                onChange={handleSelection}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
            <Text>Autoplay minutes: {selectedValue}</Text>

        </Card>
    );
        
};