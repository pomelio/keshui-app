import { useFonts } from 'expo-font';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TrackPlayer, { Capability } from 'react-native-track-player';

import { AppContext } from '@/Context';

import { GRAPHQL_ROOT } from '@/constants/conf';
import { GraphQLContext } from '@/GraphQLContext';
import GraphQLClient from '@/graphql';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



// Initialize Apollo Client
const _graphqlClient = new GraphQLClient(GRAPHQL_ROOT);

let initSession = {
  token: null,
  account: null,
  fontSize: "xl",
  playSpeed: 1.0,
  autoplay: 0,
  openADS: null,
  lang: 'Chinese'
};



export { ErrorBoundary } from 'expo-router';

export default function RootLayout(props) {

  const inited = useRef(false);
  let [session, setSession] = useState(initSession);

  const params = useLocalSearchParams();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  let openADS = params.openADS;
  if (openADS !== undefined) {
    openADS = session.openADS;
  }



  console.log(`---root layout`);





  useEffect(() => {

    TrackPlayer.registerPlaybackService(() => {
      return async () => {

        TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
        TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());


      };
    });

    async function run() {
      if (!inited.current) {
        inited.current = true;
        await TrackPlayer.setupPlayer();
      
        await TrackPlayer.updateOptions({
          progressUpdateEventInterval: 0.2,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Skip,
            Capability.SkipToNext,
            Capability.SkipToPrevious
          ],
        });
      }
    }

    run();


  }, []);

  useEffect(() => {
    const run = async () => {

      console.log(`---root layout---load AsyncStorage--start`);
      const fontSize = await AsyncStorage.getItem('fontSize');
      if (fontSize) {
        let nsession = Object.assign(session, { fontSize });
        setSession(nsession);

      }

      const autoplay = await AsyncStorage.getItem('autoplay');
      if (autoplay) {
        console.log(`---root layout---autoplay:${autoplay}`);
        let nsession = Object.assign(session, { autoplay });
        setSession(nsession);
      }


      let playSpeed = await AsyncStorage.getItem('playSpeed');

      if (playSpeed) {
        playSpeed = Number.parseFloat(playSpeed);
        let nsession = Object.assign(session, { playSpeed });
        setSession(nsession);

      }
    };

    run();
  }, []);

  useEffect(() => {

    const run = async () => {

      if (loaded) {
        SplashScreen.hideAsync();

        if (!openADS) {
          router.push('/openads');
        }
      }

    }


    run();
  }, [loaded, openADS]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light"><GraphQLContext.Provider value={{ client: _graphqlClient }}>
      <AppContext.Provider value={{ setSession, session }}>

        <Stack>
          <Stack.Screen name="openads" options={{ title: 'ADS', headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ title: 'Home', headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>

      </AppContext.Provider>
    </GraphQLContext.Provider></GluestackUIProvider>
  );
}

