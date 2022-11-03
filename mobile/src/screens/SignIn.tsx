import { Fontisto } from '@expo/vector-icons';
import { Center, Icon, Text } from 'native-base';
import Logo from '../assets/logo.svg';
import { Button } from '../components/Button';

import { useAuth } from '../hooks/useAuth';

export function SignIn(){

    const { signIn, user } = useAuth();

    return(
        <Center flex={1} bgColor='gray.900' alignItems="center" justifyContent="center" p={7}>
            <Logo width={212} height={40} />

            <Button 
                title='Entrar com o Google'
                leftIcon={ <Icon as={Fontisto} name="google" color="white" fontSize="md" /> }
                type="Secondary"
                mt={12}
                onPress={signIn}
             />
            
            <Text
                color="white"
                textAlign="center"
                px={6}
                mt={4}
            >
                Não utilizamos nenhuma informação além do seu e-mail para a criação da sua conta.
            </Text>
        </Center>
    )
}