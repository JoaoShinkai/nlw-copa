import { Octicons } from '@expo/vector-icons';
import { FlatList, Icon, useToast, VStack } from 'native-base';
import { useCallback, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { api } from '../services/api';

import { EmptyPoolList } from '../components/EmptyPoolList';
import { Loading } from '../components/Loading';
import { PoolCard, PoolCardProps } from '../components/PoolCard';

export function Pools(){
    const [pools, setPools] = useState<PoolCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const toast = useToast();

    const navigation = useNavigation();

    async function listPools(){
        try{
            setIsLoading(true);
            const response = await api.get('/pools');

            setPools(response.data.pools);
        }catch(err){
            console.log(err);

            toast.show({
                title: 'Erro ao carregar bolões',
                placement: 'top',
                bgColor: 'red.500'
            })

        }finally{
            setIsLoading(false);
        }
    } 

    // useFocusEffect vai executar a função sempre que a página receber o foco, diferente do useEffect que executava apenas na montagem
    // useCallback vai garantir que a função não seja executada múltiplas vezes. (Recomendado usar com useFocusEffect para garantir performance).
    useFocusEffect(useCallback(() => {
        listPools();
    }, []));

    return(
        <VStack flex={1} bgColor="gray.900">
            <Header title="Meus bolões" /> 

            <VStack mt={6} mx={5} borderBottomWidth={1} borderBottomColor="gray.600" pb={4} mb={4} >
                <Button 
                    title='Buscar bolão por código'
                    leftIcon={<Icon as={Octicons} name="search" color="black" size="md" />}
                    onPress={() => navigation.navigate('find')}
                 />
            </VStack>

            

            {
                isLoading ? 
                <Loading /> 
                : 
                <FlatList
                    data={pools}
                    keyExtractor={item => item.id}
                    renderItem={
                        ({ item }) => (
                            <PoolCard 
                                data={item}
                                onPress={() => navigation.navigate('details', { id: item.id })}
                             />
                        )
                    }
                    px={5}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{ pb: 10 }}
                    ListEmptyComponent={() => <EmptyPoolList />}
                />
            }
            
        </VStack>
    )
}