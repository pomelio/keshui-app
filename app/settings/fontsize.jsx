import React, { useState, useContext } from 'react';

import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@/components/ui/select';

import {ArrowDownIcon} from '@/components/ui/icon';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '@/Context';
import { useRouter } from 'expo-router';

export default function Langs(props) {

    const [selectedSize, setSelectedSize] = useState(null);
    const { session, setSession } = useContext(AppContext);
    const router = useRouter();

    const OPTIONS = {
        Large: 'xl',
        Normal: 'md',
        Small: 'sm',
    }

    const handleSelection = async (size) => {
        setSelectedSize(size);
        let nsession = Object.assign(session, {fontSize: size});
        setSession(nsession);
        await AsyncStorage.setItem('fontSize', size);
    };

    return <Center>
        <Box className='pt-[100px]'>

            <Select selectedValue={selectedSize} onValueChange={handleSelection} >
                <SelectTrigger variant="outline" size="md" >
                    <SelectInput placeholder="Select FontSize" />
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