import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { editarNumero } from '../services/apiClient';
import LoadingModal from './LoadingModal';

const EditNumeroModal = ({ visible, id_vendedor, numero, onClose, onSave }) => {
    const [cliente, setCliente] = useState('');
    const [estado, setEstado] = useState('');
    const [cuotasPagadas, setCuotasPagadas] = useState(0);
    const [loading, setLoading] = useState(false); 
    const [mensajeAPI, setMensaje] = useState(null);

    useEffect(() => {
        if (numero) {
            setCliente(numero.cliente || '');
            setEstado(numero.estado || '');
            setCuotasPagadas(numero.cuotas_pagadas || 0);
        }
    }, [numero]);

    const handleSave = async () => {
        if (!cliente || !estado || cuotasPagadas === '') {
            setMensaje("Error", "Por favor, complete todos los campos.");
            return;
        }

        setLoading(true); // Mostrar modal de carga

        try {
            const response = await editarNumero(id_vendedor, numero.numero, cliente, estado, cuotasPagadas);

            if (response.mensaje === 'Número actualizado correctamente') {
                setMensaje("Éxito", "Número actualizado correctamente.");
                onSave();
            } else {
                setMensaje("Error", response.mensaje || "Hubo un problema al actualizar el número.");
            }
        } catch (error) {
            setMensaje("Error", "Error al guardar los cambios.");
        } finally {
            setLoading(false); 
        }
    };

    const handleClose = () => {
        setMensaje(null);
        onClose();
    };

    if (!numero) return null;

    return (
        <Modal 
        animationType="slide" 
        transparent={true} 
        visible={visible} 
        onRequestClose={handleClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Editar Número</Text>
                    <Text style={styles.numeroText}>Número: {String(numero.numero).padStart(5, '0')}</Text>

                    <TextInput
                        style={styles.input}
                        value={cliente}
                        placeholder="Cliente"
                        onChangeText={setCliente}
                    />

                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={estado} onValueChange={setEstado} style={styles.picker}>
                            <Picker.Item label="Vendido" value="Vendido" />
                            <Picker.Item label="Disponible" value="Disponible" />
                        </Picker>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => setCuotasPagadas(prev => Math.max(0, prev - 1))}
                        >
                            <Text style={styles.adjustButtonText}>-</Text>
                        </TouchableOpacity>

                        <TextInput style={styles.inputCuotas} value={String(cuotasPagadas)} editable={false} />

                        <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => setCuotasPagadas(prev => Math.min(12, prev + 1))}
                        >
                            <Text style={styles.adjustButtonText}>+</Text>
                        </TouchableOpacity>

                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Guardar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>

                    {mensajeAPI && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>{mensajeAPI}</Text>
                            <TouchableOpacity
                                style={styles.messageCloseButton}
                                onPress={() => setMensaje(null)}
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
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        width: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        textAlign: 'center'
    },
    numeroText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginBottom: 15,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        marginBottom: 15,
        width: "100%",
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: "#f9f9f9"
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9'
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    adjustButton: {
        backgroundColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        margin: 5,
    },
    adjustButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    inputCuotas: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        width: 50,
        textAlign: 'center',
        marginHorizontal: 10,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
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

export default EditNumeroModal;