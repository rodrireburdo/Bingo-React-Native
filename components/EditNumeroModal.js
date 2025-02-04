import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importar desde el nuevo paquete
import { editarNumero } from '../services/apiClient'; 

const EditNumeroModal = ({ visible, id_vendedor, numero, onClose, onSave }) => {
    const [cliente, setCliente] = useState('');
    const [estado, setEstado] = useState('');
    const [cuotasPagadas, setCuotasPagadas] = useState(0); // Inicializar como número

    useEffect(() => {
        if (numero) {
            // Inicializar los valores con los datos del número actual
            setCliente(numero.cliente || '');
            setEstado(numero.estado || '');
            setCuotasPagadas(numero.cuotas_pagadas || 0); // Asegurarse de que sea un número
        }
    }, [numero]);

    const handleSave = async () => {
        if (!cliente || !estado || cuotasPagadas === '') {
            Alert.alert("Error", "Por favor, complete todos los campos.");
            return;
        }

        try {
            // Llamar a la función editarNumero con los datos
            const response = await editarNumero(id_vendedor, numero.numero, cliente, estado, cuotasPagadas);

            if (response.mensaje === 'Número actualizado correctamente') {
                Alert.alert("Éxito", "Número actualizado correctamente.");
                onSave();  // Llamar a la función onSave pasada como prop
                onClose(); // Cerrar el modal
            } else {
                Alert.alert("Error", response.mensaje || "Hubo un problema al actualizar el número.");
            }
        } catch (error) {
            Alert.alert("Error", "Error al guardar los cambios.");
        }
    };

    if (!numero) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
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

                    {/* Picker para el estado */}
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={estado}
                            onValueChange={(itemValue) => setEstado(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Vendido" value="Vendido" />
                            <Picker.Item label="Disponible" value="Disponible" />
                        </Picker>
                    </View>

                    {/* Cuotas pagadas con botones para incrementar y decrementar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => setCuotasPagadas(prev => Math.max(0, prev - 1))}
                        >
                            <Text style={styles.adjustButtonText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.inputCuotas}
                            value={String(cuotasPagadas)}
                            editable={false}
                        />
                        <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => setCuotasPagadas(prev => prev + 1)}
                        >
                            <Text style={styles.adjustButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Guardar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
});

export default EditNumeroModal;
