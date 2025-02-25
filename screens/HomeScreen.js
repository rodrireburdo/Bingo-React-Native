import React, { useEffect, useState, createContext, useContext } from "react";
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator, Keyboard, SafeAreaView, Dimensions, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback
} from "react-native";
import { obtenerNumerosPorVendedor, eliminarNumero } from "../services/apiClient";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import EditNumeroModal from "../components/EditNumeroModal";
import AddNumeroModal from "../components/AddNumeroModal";
import LoadingModal from '../components/LoadingModal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ListaNumeros = ({ numeros, onSelect, onDelete }) => (
    <FlatList
        data={numeros}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
            <TouchableOpacity
                style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                onPress={() => onSelect(item)}
                onLongPress={() => onDelete(item)} // Se activa al mantener presionado
            >
                <Text style={[styles.cell, styles.numeroCell]}>
                    {String(item.numero).padStart(5, "0")}
                </Text>
                <Text style={[styles.cell, styles.nombreCell]}>
                    {item.cliente || "Sin asignar"}
                </Text>
                <Text style={[styles.cell, styles.cuotasCell]}>
                    {meses[item.cuotas_pagadas - 1] || "Ninguna"}
                </Text>
            </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
            <View style={[styles.row, styles.header]}>
                <Text style={[styles.headerText, styles.numeroCell]}>Número</Text>
                <Text style={styles.headerText}>Nombre</Text>
                <Text style={[styles.headerText, styles.cuotasCell]}>Cuotas</Text>
            </View>
        )}
        ListEmptyComponent={() => (
            <Text style={styles.noData}>No hay números disponibles.</Text>
        )}
    />
);

const HomeScreen = ({ route }) => {
    const { vendedor } = route.params;
    const navigation = useNavigation();
    const [numeros, setNumeros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNumero, setSelectedNumero] = useState(null);
    const [index, setIndex] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [selectedStartMonth, setSelectedStartMonth] = useState("");
    const [selectedEndMonth, setSelectedEndMonth] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
        });
    };

    const closeMenu = () => {
        if (menuVisible) {
            setMenuVisible(false);
        }
    };

    // Función para obtener el número de elementos filtrados por estado
    const getFilteredCount = (estado) => {
        return filteredNumeros.filter(item => item.estado.toLowerCase() === estado.toLowerCase()).length;
    };

    const fetchNumeros = async () => {
        setLoading(true);
        try {
            const response = await obtenerNumerosPorVendedor(vendedor.id_vendedor);
            setNumeros(response.numeros || []);
        } catch (error) {
            console.error("Error al obtener los números:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNumeros();
    }, [vendedor.id_vendedor]);

    const filteredNumeros = numeros.filter(item => {
        const matchesSearch = item.cliente.toLowerCase().includes(searchText.toLowerCase()) ||
            String(item.numero).includes(searchText);

        const cuotaMes = item.cuotas_pagadas;
        const matchesMonthRange =
            (selectedStartMonth === "" || cuotaMes >= parseInt(selectedStartMonth)) &&
            (selectedEndMonth === "" || cuotaMes <= parseInt(selectedEndMonth));

        return matchesSearch && matchesMonthRange;
    });

    // Función para confirmar y eliminar número
    const confirmarEliminarNumero = (item) => {
        Alert.alert(
            "Eliminar Número",
            `¿Estás seguro de que quieres eliminar el número ${item.numero}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        setLoading(true);

                        try {
                            const response = await eliminarNumero(vendedor.id_vendedor, item.numero);
                            Alert.alert("Aviso", response.mensaje);
                            fetchNumeros(); // Actualizar lista después de eliminar
                        } catch (error) {
                            console.error("Error al eliminar número:", error);
                            Alert.alert("Error", "No se pudo eliminar el número.");
                        } finally {
                            setLoading(false);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const vendidos = filteredNumeros.filter(item => item.estado.toLowerCase() === "vendido");
    const disponibles = filteredNumeros.filter(item => item.estado.toLowerCase() === "disponible");

    const renderScene = SceneMap({
        vendidos: () => <ListaNumeros numeros={vendidos} onSelect={setSelectedNumero} onDelete={confirmarEliminarNumero} />,
        disponibles: () => <ListaNumeros numeros={disponibles} onSelect={setSelectedNumero} onDelete={confirmarEliminarNumero} />,
    });

    const routes = [
        { key: "vendidos", title: "Vendidos" },
        { key: "disponibles", title: "Disponibles" },
    ];

    return (
        <TouchableWithoutFeedback onPress={closeMenu} accessible={false}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <LoadingModal visible={loading && !modalVisible && selectedNumero == null} />

                    {/* Botón de menú */}
                    <TouchableOpacity
                        onPress={() => setMenuVisible(!menuVisible)}
                        style={styles.menuButton}
                    >
                        <View style={styles.menuContent}>
                            <FontAwesome name="user" size={24} color="#fff" />
                            <Text style={styles.menuText}>{vendedor.nombre}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Menú desplegable */}
                    {menuVisible && (
                        <View style={styles.menu}>
                            <TouchableOpacity onPress={handleLogout}>
                                <Text style={styles.menuItem}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Filtros */}
                    <View style={styles.filtersContainer}>
                        <View style={styles.searchContainer}>
                            <FontAwesome6 name="magnifying-glass" size={20} color="gray" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar por nombre o número"
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholderTextColor="gray"
                            />
                        </View>
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedStartMonth}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setSelectedStartMonth(itemValue)}
                                >
                                    <Picker.Item label="Desde" value="" />
                                    {meses.map((mes, index) => (
                                        <Picker.Item key={index} label={mes} value={(index + 1).toString()} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedEndMonth}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setSelectedEndMonth(itemValue)}
                                >
                                    <Picker.Item label="Hasta" value="" />
                                    {meses.map((mes, index) => (
                                        <Picker.Item key={index} label={mes} value={(index + 1).toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <LoadingModal visible={loading} />

                    <View style={styles.countContainer}>
                        <Text style={styles.filteredCountText}>
                            Bingos vendidos: {getFilteredCount('vendido')} 
                        </Text>
                    </View>

                    {/* TabView */}
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get("window").width }}
                        renderTabBar={(props) => (
                            <TabBar
                                {...props}
                                indicatorStyle={{ backgroundColor: "#F108B2" }}
                                style={styles.tabBar}
                                labelStyle={styles.tabLabel}
                            />
                        )}
                    />
                </View>

                {/* Botón para añadir número */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>Añadir Número</Text>
                </TouchableOpacity>

                {/* Modales */}
                <AddNumeroModal
                    visible={modalVisible}
                    idVendedor={vendedor.id_vendedor}
                    onClose={() => setModalVisible(false)}
                    onSuccess={fetchNumeros}
                />
                <EditNumeroModal
                    visible={!!selectedNumero}
                    numero={selectedNumero}
                    id_vendedor={vendedor.id_vendedor}
                    onClose={() => setSelectedNumero(null)}
                    onSave={fetchNumeros}
                />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 35 },
    container: { flex: 1, padding: 0 },
    filteredCountText: {fontSize: 16, color: "#333", textAlign: "center", marginBottom: 4, },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10, },
    row: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderColor: "#ddd", width: "100%" },
    rowEven: { backgroundColor: "#f1f1f1" },
    rowOdd: { backgroundColor: "#fff" },
    header: { backgroundColor: "#3498db", width: "100%", color: "white" },
    headerText: { flex: 1, fontWeight: "bold", color: "white", textAlign: "center", },
    cell: { flex: 1, textAlign: "center", paddingHorizontal: 5 },
    nombreCell: {},
    numeroCell: { flex: 0.5 },
    cuotasCell: { flex: 0.6 },
    noData: { textAlign: "center", fontSize: 16, marginTop: 20, color: "black" },
    tabBar: { backgroundColor: "#3498db" },
    tabLabel: { color: "white", fontWeight: "bold" },
    headerContainer: { alignItems: 'flex-end', marginBottom: 20, },
    addButton: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: "#3498db", alignItems: 'center', justifyContent: 'center', elevation: 5, },
    addButtonText: { color: "white", fontSize: 15, fontWeight: "bold", textAlign: 'center', },
    filtersContainer: { justifyContent: "space-between", marginTop: 10, paddingHorizontal: 10, },
    searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", height: 50, paddingHorizontal: 10, },
    searchIcon: { marginRight: 10, },
    searchInput: { flex: 1, fontSize: 16, color: "#333", height: 40, },
    pickerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5, },
    pickerWrapper: { flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#ccc", marginHorizontal: 5, borderRadius: 10, },
    picker: { height: 55, },
    menuContainer: { marginButtom: 10, },
    menuContent: { flexDirection: "row", alignItems: "center", gap: 8, },
    menuText: { fontSize: 16, fontWeight: "bold", color: "#fff", },
    menuButton: { backgroundColor: "#3498db", paddingVertical: 10, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, },
    menu: { position: 'absolute', top: 50, right: "30%", backgroundColor: '#fff', borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 5, padding: 10, width: 150, zIndex: 999, },
    menuItem: { padding: 10, fontSize: 16, color: '#333', },
});

export default HomeScreen;