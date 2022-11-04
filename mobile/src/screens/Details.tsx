import { useRoute } from '@react-navigation/native';
import { HStack, useToast, VStack } from 'native-base';
import { useEffect, useState } from 'react';
import { Share } from 'react-native';

import { EmptyMyPoolList } from '../components/EmptyMyPoolList';
import { Guesses } from '../components/Guesses';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Option } from '../components/Option';
import { PoolCardProps } from '../components/PoolCard';
import { PoolHeader } from '../components/PoolHeader';

import { api } from '../services/api';

interface RouteParams {
    id: string;
}

export function Details(){
    const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses');
    const [isLoading, setIsLoading] = useState(true);
    const [poolDetails, setPoolDetails] = useState<PoolCardProps>({} as PoolCardProps)

    const route = useRoute();
    const { id } = route.params as RouteParams;

    const toast = useToast();

    async function loadPoolDetails(){
        try{
            setIsLoading(true);

            const response = await api.get(`/pools/${id}`);

            setPoolDetails(response.data.pool)
        }catch(err){
            console.log(err);

            toast.show({
                title: 'Não foi possível carregar os detalhes do bolão',
                placement: 'top',
                bgColor: 'red.500'
            })
            
        }finally{
            setIsLoading(false);
        }
    }

    async function handleCoreShare(){
        await Share.share({
            message: poolDetails.code
        })
    }

    useEffect(() => {
        loadPoolDetails();
    }, [id])

    if(isLoading){
        return(
            <Loading />
        )
    }

    return(
        <VStack flex={1} bgColor="gray.900">
            <Header title={poolDetails.title} showBackButton showShareButton onShare={handleCoreShare} />

            {
                poolDetails._count?.participants > 0 ?
                <VStack px={5} flex={1}>
                    <PoolHeader data={poolDetails} />

                    <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
                        <Option 
                            title='Seus palpites' 
                            isSelected={optionSelected === 'guesses'} 
                            onPress={() => setOptionSelected('guesses')}
                        />
                        <Option 
                            title='Ranking do grupo' 
                            isSelected={optionSelected === 'ranking'} 
                            onPress={() => setOptionSelected('ranking')}
                        />
                    </HStack>

                    <Guesses poolId={poolDetails.id} code={poolDetails.code} />
                </VStack> 
                :
                <EmptyMyPoolList code={poolDetails.code} />
            }
        </VStack>
    )
}