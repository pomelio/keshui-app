import React, { useState, useContext } from 'react';

import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';

import {ArrowDownIcon} from '@/components/ui/icon';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '@/Context';

export default function PlaySpeed(props) {

    const [selectedSize, setSelectedSize] = useState(null);
    const { session, setSession } = useContext(AppContext);


    const OPTIONS = {
        Slow: 0.8,
        Normal: 1.0,
        Fast: 1.5,
    }

    const handleSelection = async (playSpeed) => {
        setSelectedSize(playSpeed);
        let nsession = Object.assign(session, {playSpeed});
        setSession(nsession);
        await AsyncStorage.setItem('playSpeed', "" + playSpeed);
    };

    return <Center>
        <Box className='pt-[100px]'>

            <Select selectedValue={selectedSize} onValueChange={handleSelection} >
                <SelectTrigger variant="outline" size="md" >
                    <SelectInput placeholder="Select Speed" />
                    <SelectIcon className="mr-3" as={ArrowDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {Object.keys(OPTIONS).map((size) => (
                            <SelectItem key={size} label={size} value={OPTIONS[size]} />
                        ))}

                    </SelectContent>
                </SelectPortal>
            </Select>

        </Box>
    </Center>;
};