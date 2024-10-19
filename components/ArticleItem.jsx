

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import dayjs from 'dayjs';


import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ArticleItem = (props) => {

    let { article, session } = props;

    let summaryLine = article.summary[0];
    let langText = summaryLine[session.lang];


    let content = null;


    content = <VStack>
        <Text size={session.fontSize} className="py-2">
            {langText}
        </Text>


    </VStack>;



    return (<VStack className="bg-secondary-0 mt-4 rounded p-2"  >
        <Image source={{ uri: article.photo.data }} className='w-full h-[200px] rounded-sm' alt={'article'} />
        <Text size="md" className='tracking-wide' >{dayjs(article.pubDate).fromNow()}</Text>
        {content}


    </VStack>);
}

export default ArticleItem;
