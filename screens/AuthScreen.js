import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { autenticarVendedor, crearVendedor, validarCodigo } from '../services/apiClient';
import LoadingModal from '../components/LoadingModal';

const AuthScreen = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [codigo, setCodigo] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isCodeVerification, setIsCodeVerification] = useState(false);
    const [loading, setLoading] = useState(false); // Estado para mostrar el modal de carga

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !nombre)) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isLogin) {
                response = await autenticarVendedor(email, password);
                if (response.mensaje === "Tu cuenta no está verificada. Revisa tu correo y valida tu código.") {
                    setVendedor(response);
                    setIsCodeVerification(true);
                    Alert.alert('Verificación', 'Debes verificar tu cuenta. Ingresa el código enviado a tu correo.');
                    return;
                }
            } else {
                response = await crearVendedor(nombre, email, password);
                if (response.id_vendedor) {
                    setVendedor(response);
                    setIsCodeVerification(true);
                    Alert.alert('Verificación', 'Revisa tu correo electrónico para obtener el código de verificación.');
                    return;
                }
            }

            if (response.id_vendedor) {
                navigation.replace('Home', { vendedor: response });
            } else {
                Alert.alert('Error', response.mensaje);
            }
        } catch (error) {
            console.error('Error en la autenticación:', error);
            Alert.alert('Error', 'Ocurrió un problema, inténtalo de nuevo.');
        } finally {
            setLoading(false); // Desactivar el modal de carga
        }
    };

    const handleVerifyCode = async () => {
        if (codigo.length !== 6) {
            Alert.alert('Error', 'El código debe tener 6 dígitos');
            return;
        }

        setLoading(true); // Activar el modal de carga

        try {
            const response = await validarCodigo(email, codigo);

            if (response.mensaje === 'Código validado correctamente') {
                const vendedorActualizado = await autenticarVendedor(email, password);

                if (vendedorActualizado.id_vendedor) {
                    setVendedor(vendedorActualizado);
                    navigation.replace('Home', { vendedor: vendedorActualizado });
                } else {
                    Alert.alert('Error', 'No se pudo recuperar la información del vendedor.');
                }
            } else {
                Alert.alert('Error', 'Código incorrecto. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al validar código:', error);
            Alert.alert('Error', 'Ocurrió un problema, inténtalo de nuevo.');
        } finally {
            setLoading(false); // Desactivar el modal de carga
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LoadingModal visible={loading} /> 
            
            {isCodeVerification ? (
                <>
                    <Text style={styles.title}>Verificar Código</Text>

                    <TextInput
                        placeholder="Código de 6 dígitos"
                        style={styles.input}
                        value={codigo}
                        onChangeText={setCodigo}
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                        <Text style={styles.buttonText}>Verificar</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>
                    {!isLogin && (
                        <TextInput
                            placeholder="Nombre"
                            style={styles.input}
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    )}
                    <TextInput
                        placeholder="Correo"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        placeholder="Contraseña"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.button} onPress={handleAuth}>
                        <Text style={styles.buttonText}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text style={styles.switchText}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff', 
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007BFF', 
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        width: '100%', 
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 20,
        color: '#007BFF',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AuthScreen; 