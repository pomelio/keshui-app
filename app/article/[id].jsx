import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Share, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Audio } from 'expo-av';

import { ShareIcon } from '@/components/ui/icon';
import { PlayIcon, Icon } from '@/components/ui/icon';
import {  CirclePause, HelpCircle, ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { AppContext } from '@/Context';
import SwipeGesture from "@/components/SwipeGesture";



import dayjs from 'dayjs';

import relativeTime from "dayjs/plugin/relativeTime";

import TrackPlayer, {
    State,
    Event,
    useTrackPlayerEvents,
} from 'react-native-track-player';

import { useArticle } from '@/hooks/useArticle';


dayjs.extend(relativeTime);

const logo = require('@/assets/images/icon.png');

const sound = new Audio.Sound();


const DetailScreen = () => {
    const navigation = useNavigation();
    const { id } = useLocalSearchParams();

    const { session } = useContext(AppContext);

    const flatListRef = useRef(null);
    const swipped = useRef(false);
    const fetched = useRef(false);

    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
   
    const [startTime, setStartTime] = useState(Date.now());

    const [status, setStatus] = useState(null);
   

    let { article, fetchNext, next, prev } = useArticle(id);

    let lang = session.lang;

    useEffect(() => {

        navigation.setOptions({
            title: 'EnLearn',

            headerRight: () => (
                <HStack space="lg">
                    <Pressable onPress={async () => {
                        router.push('/article/demo');
                    }}>

                        <Icon as={HelpCircle} size="lg" className="m-2"/>

                    </Pressable>
                    <Pressable onPress={async () => {
                        if (!article) {
                            return;
                        }

                        try {
                            const url = `https://enlearn.us.pagwe.net/article/${article._id}`; // Deep Link URL
                            const message = article.summary[0][lang];

                            const shareOptions = {
                                title: 'EnLearn',
                                message,
                                url,
                            };

                            await Share.share(shareOptions);
                        } catch (error) {
                            console.error('Error sharing:', error);
                        }

                    }}>

                        <Icon as={ShareIcon} size="lg" className="m-2"/>

                    </Pressable>

                </HStack>
                

            ),

        });

    }, [article]);



    useEffect(() => {
        swipped.current = false;
        fetched.current = false;

        const run = async () => {
            try {


                let lines = article.summary;
                let artist = 'EnLearn';
                let artwork = logo;
                let tracks = article.audios.map((a, idx) => {
                    let line = lines[idx];
                    let title = line.English;
                    let url = a.url;
                    return {
                        title, artist, artwork, url
                    };

                });


                await TrackPlayer.reset();
                await TrackPlayer.setRate(session.playSpeed);
                await TrackPlayer.add(tracks);
                if (session.autoplay !== 0) {
                    await TrackPlayer.play();
                }

            } catch (error) { console.log(error); }
        };
        if (article) {
            run();
        }


        return async () => {
            await TrackPlayer.reset();

        }

    }, [article]);

    useEffect(() => {
        TrackPlayer.addEventListener('remote-next', async () => {
            if (currentIndex == article.audios.length - 1) {
                next();
            } else {
                setCurrentIndex(currentIndex + 1);
                await TrackPlayer.skip(currentIndex + 1);
                await TrackPlayer.play();
            }
        });
        TrackPlayer.addEventListener('remote-previous', async () => {
            if (currentIndex == 0) {
                prev();
            } else {
                setCurrentIndex(currentIndex - 1);
                await TrackPlayer.skip(currentIndex - 1);
                await TrackPlayer.play();
            }
        });

        return () => {
            TrackPlayer.removeAllListeners('remote-next');
            TrackPlayer.removeAllListeners('remote-previous');
        }

    }, [article, currentIndex]);


    useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackProgressUpdated, Event.PlaybackState], async event => {

        console.log(`-----event-------`);
        console.log(JSON.stringify(event));

        if (event.type === Event.PlaybackActiveTrackChanged) {


            if (event.index === undefined) {
                return;
            }

            //const { title, artwork, artist } = event.track;
            //console.log(event.track);
            console.log(`---track-index--${event.index}`);

            setCurrentIndex(event.index);
            if (flatListRef.current) {
                if (event.index < article.summary.length) {
                    flatListRef.current.scrollToIndex({ index: event.index, animated: true });
                }
            }

            if (event.index === 0) {
                if (!fetched.current) {
                    fetched.current = true;
                    fetchNext().then(async () => {
                        if (swipped.current) {
                            next();
                        }
                    });
                }

            }


        }

        if (event.type === Event.PlaybackProgressUpdated) {

            if (session.autoplay > 0) {
                let nw = Date.now();
                let delta = nw - startTime;
                if (delta > session.autoplay * 60 * 1000) {
                    await TrackPlayer.pause();
                    setStartTime(nw);
                }
            }

            
        }

        if (event.type === Event.PlaybackState) {

            if (event.state === State.Ended) {
                await TrackPlayer.pause();
                setStatus(null);
                setCurrentIndex(0);
                //await TrackPlayer.skip(0);
                if (!swipped.current && session.autoplay > 0) {
                    swipped.current = true;
                    if (!fetched.current) {
                        fetched.current = true;
                        await fetchNext();
                    }
                    next();
                }

            } else if ((event.state === State.Playing || event.state === State.Buffering || event.state === State.Loading) && status !== 'playing') {
                setStatus('playing');
            } else if (event.state === State.Paused && status !== 'paused') {
                setStatus('paused');
            }
        }

    });

    

    const playSound = useCallback(async () => {
        setStartTime(Date.now());
        await TrackPlayer.play();

    }, []);

    const pauseSound = async () => {
        await TrackPlayer.pause();
    };

    const resumeSound = async () => {
        await TrackPlayer.play();
    };

    const handleNext = useCallback(async () => {

        if (currentIndex == article.audios.length - 1) {
            next();
        } else {
            setCurrentIndex(currentIndex + 1);
            await TrackPlayer.skip(currentIndex + 1);
            await TrackPlayer.play();
        }
    }, [currentIndex, article]);

    const handlePrev = useCallback(async () => {
        if (currentIndex == 0) {
            prev();
        } else {
            setCurrentIndex(currentIndex - 1);
            await TrackPlayer.skip(currentIndex - 1);
            await TrackPlayer.play();
        }
    }, [currentIndex]);

    const renderItem = ({ item, index }) => (
        <VStack>
            
            <Pressable onPress={async () => {
                if (status === 'playing') {

                    TrackPlayer.pause();
                    return;
                } else {
                    if (currentIndex !== index) {
                        setCurrentIndex(index);
                        await TrackPlayer.skip(index);
                        await TrackPlayer.play();
                    } else {
                        await TrackPlayer.play();
                    }

                }
            }} onLongPress={
                async () => {
                    setCurrentIndex(index);
                    await TrackPlayer.skip(index);
                    await TrackPlayer.play();
                }
            } >
                <Text size={session.fontSize} className='tracking-wide'>
                    {item[lang]}
                </Text>
            </Pressable>
        </VStack>

    );

    if (!article) {
        return <Card className="rounded-lg m-1 h-full flex justify-center items-center" >
            <Spinner size="large" />
            <Text size="md">Please Wait</Text>
        </Card>;
    }

    const onSwipePerformed = async (action) => {

        switch (action) {
            case 'left': {
                console.log('left Swipe performed');
                break;
            }
            case 'right': {
                console.log('right Swipe performed');
                break;
            }
            case 'up': {
                console.log('up Swipe performed');
                if (!swipped.current) {
                    swipped.current = 'swiped';
                    if (!fetched.current) {
                        fetched.current = true;
                        await fetchNext();
                    }
                    next();
                }

                break;
            }
            case 'down': {
                console.log('down Swipe performed');
                prev();
                break;
            }
            default: {
                console.log('Undeteceted action');
            }
        }
    };

    return (<Card className="rounded-lg m-1" >
        
        <SwipeGesture key="image" className="h-1/4 relative" onSwipePerformed={onSwipePerformed}>
            <VStack>
                <Image source={{ uri: article.photo.data }} className='w-full h-[200px] rounded-sm' alt={'english'} />
                <HStack space="lg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Pressable className="bg-blue-200 p-2 rounded-full" onPress={handlePrev}>
                        <Icon as={ArrowBigLeftDash} size="xl" />
                    </Pressable>
                    <Pressable className="bg-blue-200 p-2 rounded-full" onPress={!status ? playSound : status === 'playing' ? pauseSound : resumeSound}>
                        {status === 'playing' ? <Icon as={CirclePause} size="xl" /> : <Icon as={PlayIcon} size="xl" />}
                    </Pressable>
                    <Pressable className="bg-blue-200 p-2 rounded-full " onPress={handleNext}>
                        <Icon as={ArrowBigRightDash} size="xl" />
                    </Pressable>
                </HStack>
            </VStack>
        </SwipeGesture>
        
        <VStack key="list" className="h-3/4" >
            <FlatList
                ref={flatListRef}
                removeClippedSubviews={true}
                data={article.summary}
                renderItem={renderItem}
            />
        </VStack>

    </Card>);

};

export default DetailScreen;