import React, { useEffect, useState, createContext, useContext } from "react";
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Dimensions, TouchableOpacity, TextInput, Keyboard } from "react-native";
import { obtenerNumerosPorVendedor } from "../services/apiClient";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import EditNumeroModal from "../components/EditNumeroModal";
import AddNumeroModal from "../components/AddNumeroModal";

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ListaNumeros = ({ numeros, onSelect }) => (
    <FlatList
        data={numeros}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
            <TouchableOpacity
                style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                onPress={() => onSelect(item)}
            >
                <Text style={[styles.cell, styles.numeroCell]}>
                    {String(item.numero).padStart(5, "0")}
                </Text>
                <Text style={[styles.cell, styles.nombreCell]}>
                    {item.cliente || "Sin asignar"}
                </Text>
                <Text style={[styles.cell, styles.cuotasCell]}>
                    {meses[item.cuotas_pagadas - 1] || "0"}
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
        // Lógica para cerrar sesión (limpiar almacenamiento, redirigir a login, etc.)
        navigation.navigate("Auth");  // Cambiar "Login" al nombre de tu pantalla de inicio de sesión
    };
    const closeMenu = () => {
        setMenuVisible(false);
    };

    const handleTouchablePress = () => {
        // Cerrar el teclado si está abierto y también cerrar el menú
        Keyboard.dismiss();
        closeMenu();
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

    const vendidos = filteredNumeros.filter(item => item.estado.toLowerCase() === "vendido");
    const disponibles = filteredNumeros.filter(item => item.estado.toLowerCase() === "disponible");

    const renderScene = SceneMap({
        vendidos: () => <ListaNumeros numeros={vendidos} onSelect={setSelectedNumero} />,
        disponibles: () => <ListaNumeros numeros={disponibles} onSelect={setSelectedNumero} />,
    });

    const routes = [
        { key: "vendidos", title: "Vendidos" },
        { key: "disponibles", title: "Disponibles" },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
            <View>
                        <TouchableOpacity
                            onPress={() => setMenuVisible(!menuVisible)}
                            style={styles.menuButton}
                        >
                            <Text style={styles.menuText}>
                                {vendedor.nombre}
                            </Text>
                        </TouchableOpacity>

                        {menuVisible && (
                            <View style={styles.menu}>
                                <TouchableOpacity onPress={handleLogout}>
                                    <Text style={styles.menuItem}>Cerrar Sesión</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                <View style={styles.filtersContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre o número"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStartMonth}
                                style={styles.picker}
                                onValueChange={(itemValue) => setSelectedStartMonth(itemValue)}
                            >
                                <Picker.Item label="Mes de inicio" value="" />
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
                                <Picker.Item label="Mes de fin" value="" />
                                {meses.map((mes, index) => (
                                    <Picker.Item key={index} label={mes} value={(index + 1).toString()} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#3498db" />
                ) : (
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get("window").width }}
                        renderTabBar={(props) => (
                            <TabBar
                                {...props}
                                indicatorStyle={{ backgroundColor: "#fff" }}
                                style={styles.tabBar}
                                labelStyle={styles.tabLabel}
                            />
                        )}
                    />
                )}
            </View>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.addButton}
            >
                <Text style={styles.addButtonText}>Añadir Número</Text>
            </TouchableOpacity>
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
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 50 },
    container: { flex: 1, padding: 0 }, 
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
    addButton: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: "#3498db", alignItems: 'center', justifyContent: 'center',   elevation: 5,  },
    addButtonText: { color: "white", fontSize: 15, fontWeight: "bold",textAlign: 'center', },
    filtersContainer: { justifyContent: "space-between", marginBottom: 10, marginTop: 10, paddingHorizontal: 10, },
    searchInput: { height: 40, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, backgroundColor: "white", fontSize: 16,  marginBottom: 10, },
    pickerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
    pickerWrapper: { flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#ccc", marginHorizontal: 5, },
    picker: { backgroundColor: "#fff", height: "49", },
    menuContainer: { marginButtom: 10, },
    menuButton: { padding: 9, backgroundColor: '#3498db', alignItems: 'center', justifyContent: 'center', marginButtom: 100, },
    menuText: { color: 'white', fontSize: 16, },
    menu: { position: 'absolute', top: 50,  right: "30%", backgroundColor: '#fff', borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.3,shadowOffset: { width: 0, height: 4 }, shadowRadius: 4, elevation: 5, padding: 10, width: 150, zIndex: 999, },
    menuItem: { padding: 10, fontSize: 16, color: '#333', },
});

export default HomeScreen;