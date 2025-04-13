import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { agregarNumerosDisponibles } from '../services/apiClient';
import LoadingModal from './LoadingModal';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddNumeroModal = ({ visible, idVendedor, onClose, onSuccess }) => {
    const [numeros, setNumeros] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [mensajeAPI, setMensajeAPI] = useState(null);
    const scrollViewRef = useRef(null);

    const handleAgregarNumero = () => {
        if (numeros.length >= 20) { // Límite práctico de campos visibles
            setMensajeAPI('Has alcanzado el máximo de números que puedes agregar a la vez');
            return;
        }
        
        setNumeros([...numeros, '']);
        
        // Hacer scroll al final después de un pequeño delay
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleEliminarNumero = (index) => {
        if (numeros.length > 1) {
            const nuevosNumeros = [...numeros];
            nuevosNumeros.splice(index, 1);
            setNumeros(nuevosNumeros);
        }
    };

    const handleCambioNumero = (text, index) => {
        // Validar que sea numérico y esté en el rango permitido
        const numero = parseInt(text);
        if (text === '') {
            const nuevosNumeros = [...numeros];
            nuevosNumeros[index] = '';
            setNumeros(nuevosNumeros);
        } else if (!isNaN(numero) && numero >= 1 && numero <= 26000) {
            const nuevosNumeros = [...numeros];
            nuevosNumeros[index] = text;
            setNumeros(nuevosNumeros);
        }
    };

    const handleAgregar = async () => {
        Keyboard.dismiss(); // Ocultar teclado
        
        const numerosParaEnviar = numeros
            .map(num => num.trim().padStart(5, '0'))
            .filter(num => num !== '00000' && num !== '');

        if (numerosParaEnviar.length === 0) {
            setMensajeAPI('Debes ingresar al menos un número válido (1-26000)');
            return;
        }

        setLoading(true);

        try {
            const response = await agregarNumerosDisponibles(idVendedor, numerosParaEnviar);

            if (response?.mensaje) {
                setMensajeAPI(response.mensaje);
            }

            if (response.mensaje.includes("Números agregados correctamente")) {
                setNumeros(['']);
                onSuccess();
            }

        } catch (error) {
            console.error('Error al agregar números:', error);
            setMensajeAPI('No se pudieron agregar los números.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMensajeAPI(null);
        setNumeros(['']);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Agregar Números</Text>
                    
                    <ScrollView 
                        ref={scrollViewRef}
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {numeros.map((numero, index) => (
                            <View key={index} style={styles.numeroContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Número ${index + 1} (1-26000)`}
                                    value={numero}
                                    onChangeText={(text) => handleCambioNumero(text, index)}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                                {numeros.length > 1 && (
                                    <TouchableOpacity 
                                        style={styles.deleteButton}
                                        onPress={() => handleEliminarNumero(index)}
                                    >
                                        <Icon name="times" size={20} color="#dc3545" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAgregarNumero}
                    >
                        <Icon name="plus" size={20} color="#28a745" />
                        <Text style={styles.addButtonText}>Agregar otro número</Text>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleAgregar}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    {mensajeAPI && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>{mensajeAPI}</Text>
                        </View>
                    )}
                </View>
            </View>

            <LoadingModal visible={loading} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "85%",
        maxHeight: "80%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
        textAlign: 'center'
    },
    scrollContainer: {
        maxHeight: 200,
        marginBottom: 10,
    },
    scrollContent: {
        paddingBottom: 20, // Espacio extra al final para el scroll
    },
    numeroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginRight: 10,
    },
    deleteButton: {
        padding: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#28a745',
        borderRadius: 8,
    },
    addButtonText: {
        color: '#28a745',
        fontSize: 16,
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageContainer: {
        marginTop: 15,
        padding: 10,
        alignItems: "center",
    },
    messageText: {
        color: "#333",
        fontSize: 16,
        textAlign: "center",
    },
});

export default AddNumeroModal;