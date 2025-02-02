import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { autenticarVendedor, crearVendedor } from '../services/apiClient';

const AuthScreen = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !nombre)) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        let response;
        if (isLogin) {
            response = await autenticarVendedor(email, password);
        } else {
            response = await crearVendedor(nombre, email, password);
        }

        if (response.id_vendedor) {
            navigation.replace('Home', { vendedor: response });
        } else {
            Alert.alert('Error', response.mensaje);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>

            {/* Nombre (Solo en el registro) */}
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',  // Fondo gris claro
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',  // Título oscuro
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',  // Color de borde suave
        borderRadius: 8,
        backgroundColor: '#fff',  // Fondo blanco para los inputs
        fontSize: 16,
        color: '#333',  // Texto oscuro
    },
    button: {
        backgroundColor: '#007BFF',  // Color de fondo azul
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        width: '100%',  // Aseguramos que ocupe todo el ancho
    },
    buttonText: {
        color: '#fff',  // Texto blanco en el botón
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 20,
        color: '#007BFF',  // Color azul para el texto del cambio
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AuthScreen; 