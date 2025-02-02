import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { agregarNumerosDisponibles, eliminarNumero } from '../services/apiClient';

const AddNumeroModal = ({ visible, idVendedor, onClose, onSuccess }) => {
    const [numeros, setNumeros] = useState('');
    const [listaNumeros, setListaNumeros] = useState([]);

    // Función para agregar números
    const handleAgregar = async () => {
        if (!numeros.trim()) {
            Alert.alert('Error', 'Debes ingresar al menos un número.');
            return;
        }

        const nuevosNumeros = numeros.split(',').map(num => num.trim().padStart(5, '0'));

        try {
            await agregarNumerosDisponibles(idVendedor, nuevosNumeros);
            Alert.alert('Éxito', 'Números agregados correctamente.');
            setListaNumeros([...listaNumeros, ...nuevosNumeros]); // Actualizar lista localmente
            setNumeros('');
            onSuccess();
        } catch (error) {
            console.error('Error al agregar números:', error);
            Alert.alert('Error', 'No se pudieron agregar los números.');
        }
    };

    // Función para eliminar número
    const handleEliminar = (numero) => {
        Alert.alert(
            "Eliminar número",
            `¿Estás seguro de eliminar el número ${numero}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await eliminarNumero(idVendedor, numero);
                            setListaNumeros(listaNumeros.filter(n => n !== numero)); // Actualizar lista localmente
                            Alert.alert("Éxito", `Número ${numero} eliminado.`);
                        } catch (error) {
                            console.error("Error al eliminar número:", error);
                            Alert.alert("Error", "No se pudo eliminar el número.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
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
                    
                    {/* Lista de números */}
                    <FlatList
                        data={listaNumeros}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onLongPress={() => handleEliminar(item)}>
                                <Text style={styles.numeroItem}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    
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
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        marginBottom: 20,
        borderRadius: 8,
        fontSize: 16
    },
    numeroItem: {
        padding: 12,
        backgroundColor: "#f2f2f2",
        marginVertical: 5,
        borderRadius: 8,
        alignItems: "center",
        borderColor: "#ddd",
        borderWidth: 1
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
    }
});

export default AddNumeroModal;
