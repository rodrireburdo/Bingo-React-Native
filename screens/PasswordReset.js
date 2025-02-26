import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { reenviarCodigo, cambiarContrasena } from '../services/apiClient';
import { LinearGradient } from "expo-linear-gradient";
import LoadingModal from '../components/LoadingModal';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const PasswordResetScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaContrasena] = useState('');
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);

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
        <LinearGradient
            colors={["#4c669f", "#3b5998", "#192f6a"]}
            style={styles.background}
        >
            <View style={styles.container}>
                <LoadingModal visible={loading} />
                <MaterialIcons name="lock-reset" size={110} color="#fff" />

                <Text style={styles.title}>Restablecer Contraseña</Text>

                {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

                <TextInput

                />
                <View style={styles.inputContainer}>
                    <Entypo name="mail" size={24} color="black" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo"
                        placeholderTextColor="#fff"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, !email && styles.buttonDisabled]}
                    onPress={handleReenviarCodigo}
                    disabled={!email || loading}
                >
                    <Text style={styles.buttonText}>Reenviar Código</Text>
                </TouchableOpacity>

                {codigoEnviado && (
                    <>
                        <View>
                            <Text style={styles.mensajeCorreo}>* Revisa tu correo para ingresar el código *</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="verified-user" size={24} color="#fff" />
                            <TextInput
                                style={styles.input}
                                placeholder="Código de Verificación"
                                placeholderTextColor="#fff"
                                value={codigo}
                                onChangeText={setCodigo}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <FontAwesome name="lock" size={24} color="black" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nueva Contraseña"
                                placeholderTextColor="#fff"
                                value={nuevaPassword}
                                onChangeText={setNuevaContrasena}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, (!codigo || !nuevaPassword) && styles.buttonDisabled]}
                            onPress={handleCambiarContrasena}
                            disabled={!codigo || !nuevaPassword || loading}
                        >
                            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    background: {
        flex: 1,
    },
    input: {
        width: '100%',
        fontSize: 16,
        color: '#fff',
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#fff",
    },
    icon: {
        marginRight: 10,
        color: "#fff",
    },
    title: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 30,
    },
    input: {
        width: '100%',
        color: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        margin: 20,
        marginBottom: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    mensaje: {
        color: 'red',
        marginBottom: 10,
    },
    mensajeCorreo : {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    }
});

export default PasswordResetScreen;