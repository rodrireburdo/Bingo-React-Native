import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { agregarNumerosDisponibles } from '../services/apiClient';
import LoadingModal from './LoadingModal';

const AddNumeroModal = ({ visible, idVendedor, onClose, onSuccess }) => {
    const [numeros, setNumeros] = useState('');
    const [listaNumeros, setListaNumeros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensajeAPI, setMensajeAPI] = useState(null);

    // Función para agregar números
    const handleAgregar = async () => {
        if (!numeros.trim()) {
            setMensajeAPI('Debes ingresar al menos un número.');
            return;
        }

        const nuevosNumeros = numeros.split(',').map(num => num.trim().padStart(5, '0'));

        setLoading(true); 

        try {
            const response = await agregarNumerosDisponibles(idVendedor, nuevosNumeros);

            if (response?.mensaje) {
                setMensajeAPI(response.mensaje);
            }

            // Si algunos números fueron agregados, actualizamos la lista
            if (response.mensaje.includes("Números agregados correctamente")) {
                const agregados = nuevosNumeros.filter(num => response.mensaje.includes(num));
                setListaNumeros([...listaNumeros, ...agregados]);
                setNumeros('');
                onSuccess();
            }

        } catch (error) {
            console.error('Error al agregar números:', error);
            setMensajeAPI('No se pudieron agregar los números.');
        } finally {
            setLoading(false);
        }
    };

    // Función para cerrar el modal y limpiar mensaje
    const handleClose = () => {
        setMensajeAPI(null);
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
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: 1, 2, 3 o 00001, 00002"
                        value={numeros}
                        onChangeText={setNumeros}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleAgregar}>
                        <Text style={styles.saveButtonText}>Agregar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>

                    {mensajeAPI && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>{mensajeAPI}</Text>
                            <TouchableOpacity
                                style={styles.messageCloseButton}
                                onPress={() => setMensajeAPI(null)}
                            >
                                <Text style={styles.messageCloseText}>OK</Text>
                            </TouchableOpacity>
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
        width: "80%",
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
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
        fontSize: 16
    },
    saveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
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
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        alignItems: "center",
    },
    messageText: {
        color: "#333",
        fontSize: 16,
        textAlign: "center",
    },
    messageCloseButton: {
        marginTop: 10,
        backgroundColor: "#6c757d",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    messageCloseText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default AddNumeroModal;