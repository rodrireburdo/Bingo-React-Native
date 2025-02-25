import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { autenticarVendedor, crearVendedor, validarCodigo } from '../services/apiClient';
import LoadingModal from '../components/LoadingModal';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const AuthScreen = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [codigo, setCodigo] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isCodeVerification, setIsCodeVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensajeAPI, setMensajeAPI] = useState('');

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !nombre)) {
            setMensajeAPI('Todos los campos son obligatorios');
            return;
        }

        setLoading(true);
        setMensajeAPI('');

        try {
            let response;
            if (isLogin) {
                response = await autenticarVendedor(email, password);
                if (response.mensaje === "Tu cuenta no está verificada. Revisa tu correo y valida tu código.") {
                    setIsCodeVerification(true);
                    setMensajeAPI('Debes verificar tu cuenta. Ingresa el código enviado a tu correo.');
                    return;
                }
            } else {
                response = await crearVendedor(nombre, email, password);
                if (response.id_vendedor) {
                    setIsCodeVerification(true);
                    setMensajeAPI('Revisa tu correo electrónico para obtener el código de verificación.');
                    return;
                }
            }

            if (response.id_vendedor) {
                navigation.replace('Home', { vendedor: response });
            } else {
                setMensajeAPI(response.mensaje);
            }
        } catch (error) {
            console.error('Error en la autenticación:', error);
            setMensajeAPI('Ocurrió un problema, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };
    const handlePasswordReset = () => {
        navigation.navigate('PasswordReset');
    };

    const handleVerifyCode = async () => {
        if (codigo.length !== 6) {
            setMensajeAPI('El código debe tener 6 dígitos');
            return;
        }

        setLoading(true);
        setMensajeAPI('');

        try {
            const response = await validarCodigo(email, codigo);

            if (response.mensaje === 'Código validado correctamente') {
                const vendedorActualizado = await autenticarVendedor(email, password);

                if (vendedorActualizado.id_vendedor) {
                    navigation.replace('Home', { vendedor: vendedorActualizado });
                } else {
                    setMensajeAPI('No se pudo recuperar la información del vendedor.');
                }
            } else {
                setMensajeAPI('Código incorrecto. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al validar código:', error);
            setMensajeAPI('Ocurrió un problema, inténtalo de nuevo.');
        } finally {
            setLoading(false);
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

                    {mensajeAPI ? <Text style={styles.mensaje}>{mensajeAPI}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                        <Text style={styles.buttonText}>Verificar</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <FontAwesome5 name="user-circle" size={100} color="black" />
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

                    {mensajeAPI ? <Text style={styles.mensaje}>{mensajeAPI}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleAuth}>
                        <Text style={styles.buttonText}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text style={styles.switchText}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePasswordReset}>
                        <Text style={styles.switchText}>
                            ¿Olvidaste tu contraseña?
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
        backgroundColor: 'linear-gradient(45deg, fuchsia, turquoise)',
        padding: 20,
    },
    title: {
        paddingTop: 20,
        fontSize: 30,
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
    mensaje: {
        color: 'red',
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default AuthScreen;