import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { editarNumero } from '../services/apiClient';
import LoadingModal from './LoadingModal';
import Icon from 'react-native-vector-icons/FontAwesome';

const EditNumeroModal = ({ visible, id_vendedor, numero, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        cliente: '',
        estado: '',
        cuotasPagadas: 0
    });
    const [loading, setLoading] = useState(false);
    const [mensajeAPI, setMensajeAPI] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (numero) {
            setFormData({
                cliente: numero.cliente || '',
                estado: numero.estado || 'Disponible',
                cuotasPagadas: numero.cuotas_pagadas || 0
            });
            setErrors({});
            setMensajeAPI(null);
        }
    }, [numero]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.cliente.trim()) newErrors.cliente = 'Nombre del cliente requerido';
        if (!formData.estado) newErrors.estado = 'Seleccione un estado';
        if (formData.cuotasPagadas < 0 || formData.cuotasPagadas > 12) newErrors.cuotasPagadas = 'Cuotas inválidas (0-12)';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        
        if (!validateForm()) {
            setMensajeAPI('Por favor corrija los errores en el formulario');
            return;
        }

        setLoading(true);

        try {
            const response = await editarNumero(
                id_vendedor, 
                numero.numero, 
                formData.cliente, 
                formData.estado, 
                formData.cuotasPagadas
            );

            if (response.mensaje === 'Número actualizado correctamente') {
                setMensajeAPI({ type: 'success', text: 'Número actualizado correctamente' });
                onSave();
            } else {
                setMensajeAPI({ type: 'error', text: response.mensaje || "Error al actualizar el número" });
            }
        } catch (error) {
            setMensajeAPI({ type: 'error', text: "Error de conexión al guardar" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleClose = () => {
        setMensajeAPI(null);
        setErrors({});
        onClose();
    };

    if (!numero) return null;

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={visible} 
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Número</Text>
                        <Text style={styles.numeroText}>Número: {String(numero.numero).padStart(5, '0')}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nombre del Cliente</Text>
                            <TextInput
                                style={[styles.input, errors.cliente && styles.inputError]}
                                value={formData.cliente}
                                placeholder="Ingrese nombre del cliente"
                                onChangeText={(text) => handleChange('cliente', text)}
                                maxLength={50}
                            />
                            {errors.cliente && <Text style={styles.errorText}>{errors.cliente}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Estado</Text>
                            <View style={[styles.pickerContainer, errors.estado && styles.inputError]}>
                                <Picker
                                    selectedValue={formData.estado}
                                    onValueChange={(value) => handleChange('estado', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione estado" value="" enabled={false} />
                                    <Picker.Item label="Vendido" value="Vendido" />
                                    <Picker.Item label="Disponible" value="Disponible" />
                                </Picker>
                            </View>
                            {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Cuotas Pagadas</Text>
                            <View style={styles.cuotasContainer}>
                                <TouchableOpacity
                                    style={styles.adjustButton}
                                    onPress={() => handleChange('cuotasPagadas', Math.max(0, formData.cuotasPagadas - 1))}
                                    disabled={formData.cuotasPagadas <= 0}
                                >
                                    <Icon name="minus" size={16} color={formData.cuotasPagadas <= 0 ? '#aaa' : '#fff'} />
                                </TouchableOpacity>

                                <TextInput 
                                    style={[styles.inputCuotas, errors.cuotasPagadas && styles.inputError]}
                                    value={String(formData.cuotasPagadas)}
                                    onChangeText={(text) => {
                                        const num = parseInt(text) || 0;
                                        handleChange('cuotasPagadas', Math.min(12, Math.max(0, num)));
                                    }}
                                    keyboardType="numeric"
                                    maxLength={2}
                                />

                                <TouchableOpacity
                                    style={styles.adjustButton}
                                    onPress={() => handleChange('cuotasPagadas', Math.min(12, formData.cuotasPagadas + 1))}
                                    disabled={formData.cuotasPagadas >= 12}
                                >
                                    <Icon name="plus" size={16} color={formData.cuotasPagadas >= 12 ? '#aaa' : '#fff'} />
                                </TouchableOpacity>
                            </View>
                            {errors.cuotasPagadas && <Text style={styles.errorText}>{errors.cuotasPagadas}</Text>}
                        </View>

                        {mensajeAPI && (
                            <View style={[
                                styles.messageContainer,
                                mensajeAPI.type === 'success' ? styles.successMessage : styles.errorMessage
                            ]}>
                                <Text style={styles.messageText}>{mensajeAPI.text}</Text>
                            </View>
                        )}

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]} 
                                onPress={handleSave}
                            >
                                <Text style={styles.buttonText}>Guardar Cambios</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.button, styles.closeButton]} 
                                onPress={handleClose}
                            >
                                <Text style={styles.buttonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <LoadingModal visible={loading} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center'
    },
    numeroText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginBottom: 20,
        textAlign: 'center'
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    inputError: {
        borderColor: '#dc3545',
        backgroundColor: '#fffafa'
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        color: '#333',
    },
    cuotasContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    adjustButton: {
        backgroundColor: '#007BFF',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputCuotas: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        width: 60,
        textAlign: 'center',
        marginHorizontal: 10,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    buttonGroup: {
        marginTop: 15,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    closeButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    successMessage: {
        backgroundColor: '#d4edda',
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
    },
    messageText: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default EditNumeroModal;