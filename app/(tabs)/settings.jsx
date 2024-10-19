import React from 'react';

import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from 'react-native';
import { ChevronsRightIcon  } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export default function Settings(props) {

    const router = useRouter();


    return (
      <VStack className='pt-20 px-4'>
        <Pressable className='w-full border-b-2 flex-row  p-4 justify-between items-center' onPress={() => {
          router.push('/settings/fontsize');
        }}>
          <Text size="2xl">Font Size</Text>
          <Icon as={ChevronsRightIcon} size="xs" />
        </Pressable>
        <Pressable className='w-full border-b-2 flex-row  p-4 justify-between items-center' onPress={() => {
          router.push('/settings/playspeed');
        }}>
          <Text size="2xl">Audio Playback Speed</Text>
          <Icon as={ChevronsRightIcon} size="xs" />
        </Pressable>
        <Pressable className='w-full border-b-2 flex-row  p-4 justify-between items-center' onPress={() => {
          router.push('/settings/autoplay');
        }}>
          <Text size="2xl">AutoPlay</Text>
          <Icon as={ChevronsRightIcon} size="xs" />
        </Pressable>
        

      </VStack>
    );
};