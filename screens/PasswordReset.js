import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { reenviarCodigo, cambiarContrasena } from '../services/apiClient';

const PasswordResetScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaContrasena] = useState('');
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false); // Estado de carga

    const handleReenviarCodigo = async () => {
        if (!email) {
            setMensaje('Por favor, ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            const response = await reenviarCodigo(email);
            setMensaje(response.mensaje);

            if (response.mensaje === 'Código reenviado correctamente') {
                setCodigoEnviado(true);
            }
        } catch (error) {
            setMensaje('Error al reenviar el código. Inténtalo nuevamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarContrasena = async () => {
        if (!email || !codigo || !nuevaPassword) {
            setMensaje('Todos los campos son obligatorios.');
            return;
        }
    
        if (codigo.length !== 6) {
            setMensaje('El código debe tener 6 dígitos.');
            return;
        }
    
        if (nuevaPassword.length < 6) {
            setMensaje('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const response = await cambiarContrasena(email, codigo, nuevaPassword);
            setMensaje(response.mensaje);

            if (response.mensaje === 'Contraseña actualizada correctamente') {
                    setLoading(false);
                    navigation.replace('Auth');
                    return;
            }
        } catch (error) {
            setMensaje('Error al cambiar la contraseña. Inténtalo nuevamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer Contraseña</Text>

            {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity 
                style={[styles.button, !email && styles.buttonDisabled]}
                onPress={handleReenviarCodigo}
                disabled={!email || loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reenviar Código</Text>}
            </TouchableOpacity>

            {codigoEnviado && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Código de Verificación"
                        value={codigo}
                        onChangeText={setCodigo}
                        keyboardType="numeric"
                        maxLength={6}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nueva Contraseña"
                        value={nuevaPassword}
                        onChangeText={setNuevaContrasena}
                        secureTextEntry
                    />

                    <TouchableOpacity 
                        style={[styles.button, (!codigo || !nuevaPassword) && styles.buttonDisabled]}
                        onPress={handleCambiarContrasena}
                        disabled={!codigo || !nuevaPassword || loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cambiar Contraseña</Text>}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    mensaje: {
        color: 'red',
        marginBottom: 10,
    },
});

export default PasswordResetScreen;