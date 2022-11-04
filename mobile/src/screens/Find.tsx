import { Heading, useToast, VStack } from 'native-base';
import { Header } from '../components/Header';

import { Button } from '../components/Button';
import { Input } from '../components/Input';

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { api } from '../services/api';

export function Find(){

    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');

    const toast = useToast();

    const {navigate} = useNavigation();

    async function handleJoinPool(){
        setIsLoading(true);
        try{

            if(!code.trim()){
                return toast.show({
                    title: 'Informe o código',
                    placement: 'top',
                    bgColor: 'red.500'
                }) 
            }

            await api.post('/pools/join', { code });

            toast.show({
                title: 'Você entrou no bolão',
                placement: 'top',
                bgColor: 'green.500'
            })

            setCode('');
            setIsLoading(false);

            navigate('pools');

        }catch(err){
            console.log(err);
            setIsLoading(false);

            if(err.response?.data?.message === 'Pool not found'){
                return toast.show({
                    title: 'Não foi possível encontrar o bolão',
                    placement: 'top',
                    bgColor: 'red.500'
                })
            }

            if(err.response?.data?.message === 'User already joined this pool'){
                return toast.show({
                    title: 'Você já faz parte desse bolão',
                    placement: 'top',
                    bgColor: 'red.500'
                })
            }

            toast.show({
                title: 'Não foi possível entrar no bolão',
                placement: 'top',
                bgColor: 'red.500'
            })

            
        }
    }

    return(
        <VStack flex={1} bgColor="gray.900">
            <Header title='Buscar por código' showBackButton />

            <VStack mt={8} mx={5} alignItems="center">
                <Heading fontFamily="heading" color="white" fontSize="xl" mb={8} textAlign="center">
                    Encontre um bolão através de seu código único
                </Heading>

                <Input 
                    mb={2} placeholder="Qual o código do bolão?"
                    onChangeText={setCode}
                    autoCapitalize="characters"
                    value={code}
                />

                <Button 
                    title='Buscar bolão' 
                    isLoading={isLoading}
                    onPress={handleJoinPool}
                />

            </VStack>
        </VStack>
    );
}