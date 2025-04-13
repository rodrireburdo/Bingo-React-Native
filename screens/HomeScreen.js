import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Pressable,
} from "react-native";
import { obtenerNumerosPorVendedor, eliminarNumero } from "../services/apiClient";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "react-native";
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import EditNumeroModal from "../components/EditNumeroModal";
import AddNumeroModal from "../components/AddNumeroModal";
import LoadingModal from '../components/LoadingModal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import Entypo from '@expo/vector-icons/Entypo';

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ListaNumeros = ({ numeros, onSelect, onDelete }) => {
    const [sortBy, setSortBy] = useState("numero");
    const [ascending, setAscending] = useState(true);
    const [lastPress, setLastPress] = useState(0);
    const doublePressThreshold = 300;

    const toggleSort = (field) => {
        if (sortBy === field) {
            setAscending(!ascending);
        } else {
            setSortBy(field);
            setAscending(true);
        }
    };

    const sortedData = [...numeros].sort((a, b) => {
        if (sortBy === "numero") {
            return ascending ? a.numero - b.numero : b.numero - a.numero;
        } else if (sortBy === "nombre") {
            return ascending
                ? (a.cliente || "").localeCompare(b.cliente || "")
                : (b.cliente || "").localeCompare(a.cliente || "");
        } else if (sortBy === "cuotas") {
            return ascending ? a.cuotas_pagadas - b.cuotas_pagadas : b.cuotas_pagadas - a.cuotas_pagadas;
        }
        return 0;
    });

    const handleDoublePress = (item) => {
        const currentTime = Date.now();
        if (currentTime - lastPress < doublePressThreshold) {
            onSelect(item);
        }
        setLastPress(currentTime);
    };

    const renderHeader = () => (
        <View style={[styles.row, styles.header]}>
            <Pressable
                onPress={() => toggleSort("numero")}
                style={[styles.headerTouchable, styles.numeroCell]}
            >
                <Text style={styles.headerText}>
                    Número {sortBy === "numero" ? (ascending ? "↑" : "↓") : ""}
                </Text>
            </Pressable>
            <Pressable
                onPress={() => toggleSort("nombre")}
                style={[styles.headerTouchable, styles.nombreCell]}
            >
                <Text style={styles.headerText}>
                    Nombre {sortBy === "nombre" ? (ascending ? "↑" : "↓") : ""}
                </Text>
            </Pressable>
            <Pressable
                onPress={() => toggleSort("cuotas")}
                style={[styles.headerTouchable, styles.cuotasCell]}
            >
                <Text style={styles.headerText}>
                    Cuotas {sortBy === "cuotas" ? (ascending ? "↑" : "↓") : ""}
                </Text>
            </Pressable>
        </View>
    );

    const renderItem = ({ item, index }) => (
        <Pressable
            style={({ pressed }) => [
                styles.row,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                pressed && styles.pressedState
            ]}
            onPress={() => handleDoublePress(item)}
            onLongPress={() => onDelete(item)}
            delayLongPress={300}
        >
            <Text style={[styles.cell, styles.numeroCell]}>
                {String(item?.numero || 0).padStart(5, "0")}
            </Text>
            <Text
                style={[styles.cell, styles.nombreCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {item?.cliente || "Sin asignar"}
            </Text>
            <Text style={[styles.cell, styles.cuotasCell]}>
                {item?.cuotas_pagadas ? meses[item.cuotas_pagadas - 1] : "Ninguna"}
            </Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedData.filter(Boolean)}
                keyExtractor={(item, index) => item?.id?.toString() || `item-${index}`}
                keyboardShouldPersistTaps="handled"
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.noData}>No hay números disponibles.</Text>
                    </View>
                }
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={7}
                removeClippedSubviews={true}
            />
        </View>
    );
};

const HomeScreen = ({ route }) => {
    const { vendedor } = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNumero, setSelectedNumero] = useState(null);
    const [index, setIndex] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [selectedStartMonth, setSelectedStartMonth] = useState("");
    const [selectedEndMonth, setSelectedEndMonth] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const [personasAsignadas, setPersonasAsignadas] = useState([]);
    const [numeros, setNumeros] = useState([]);

    const filteredNumeros = numeros.filter(item => {
        if (!item || typeof item !== 'object') return false;

        // Filtro por búsqueda
        const cliente = item.cliente?.toLowerCase() || '';
        const numeroStr = String(item.numero || '');
        const matchesSearch = cliente.includes(searchText.toLowerCase()) ||
            numeroStr.includes(searchText);

        // Filtro por rango de meses
        const cuotaMes = parseInt(item.cuotas_pagadas) || 0;
        const startMonth = selectedStartMonth === "" ? 0 : parseInt(selectedStartMonth); // Si "Desde" está vacío, mínimo=0
        const endMonth = selectedEndMonth === "" ? 12 : parseInt(selectedEndMonth); // Si "Hasta" está vacío, máximo=12

        return matchesSearch &&
            cuotaMes >= startMonth &&
            cuotaMes <= endMonth;
    });

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

    // Función para obtener el número de elementos filtrados por estado
    const getFilteredCount = (estado) => {
        return filteredNumeros.filter(item => item.estado.toLowerCase() === estado.toLowerCase()).length;
    };

    // useEffect que escucha los cambios en 'numeros' y ejecuta guardarBingosVendidos
    useEffect(() => {
        guardarBingosVendidos();
    }, [numeros]);

    // Función para guardar en un array los números con estado "Vendido"
    const guardarBingosVendidos = async () => {
        const personasInfo = filteredNumeros
            .filter(item => item.estado.toLowerCase() === "vendido")
            .map(item => ({
                numero: String(item.numero).padStart(5, "0"),
                nombre: item.cliente || "Sin asignar",
                cuota: meses[item.cuotas_pagadas - 1] || "Ninguna",
            }));

        // Actualizamos el estado con los números vendidos
        setPersonasAsignadas(personasInfo);
    };

    const [exportar, setExportar] = useState(false); // Estado de control
    // useEffect que se ejecuta cuando 'personasAsignadas' cambia
    useEffect(() => {
        if (exportar && personasAsignadas.length > 0) {
            exportarAPDF();
            setExportar(false); // Resetear la bandera después de la exportación
        }
    }, [exportar, personasAsignadas]);


    // Función para exportar a PDF
    const exportarAPDF = () => {
        if (personasAsignadas.length === 0) {
            Alert.alert("Error", "No hay datos para exportar.");
            return;
        }

        Alert.alert(
            "Confirmar Exportación",
            "¿Deseas exportar la lista de bingos vendidos a PDF?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Exportar", onPress: async () => {
                        const htmlContent = `
                        <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    h2 { text-align: center; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                                    th { background-color: #f2f2f2; }
                                </style>
                            </head>
                            <body>
                                <h2>Lista de Bingos</h2>
                                <table>
                                    <tr>
                                        <th>Número</th>
                                        <th>Nombre</th>
                                        <th>Cuota</th>
                                    </tr>
                                    ${personasAsignadas.map(p => `
                                        <tr>
                                            <td>${p.numero}</td>
                                            <td>${p.nombre}</td>
                                            <td>${p.cuota}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                            </body>
                        </html>
                    `;

                        try {
                            // Generar el archivo PDF
                            const { uri } = await Print.printToFileAsync({ html: htmlContent });
                            // Compartir el archivo PDF
                            await shareAsync(uri, {
                                dialogTitle: 'Exportar PDF',
                                UTI: 'com.adobe.pdf',  // Tipo de archivo
                                mimeType: 'application/pdf',
                                subject: 'Lista de Bingos',
                                title: 'Lista de Bingos',  // nombre del archivo
                            });
                            console.log("PDF guardado en:", uri);
                        } catch (error) {
                            console.error("Error al exportar PDF:", error);
                            Alert.alert("Error", "No se pudo generar el PDF.");
                        }
                    }
                },
            ]
        );
    };

    // Función que se ejecuta cuando el botón es presionado
    const handleExportar = async () => {
        await guardarBingosVendidos(); // Primero actualiza los datos
        setExportar(true); // Activa la bandera para exportar
    };

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
            <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }} edges={['top']}>
                <StatusBar
                    backgroundColor="#3498db" 
                    barStyle="light-content"
                />
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
                                    onValueChange={setSelectedStartMonth}
                                >
                                    <Picker.Item label="Desde" value="0" />
                                    {meses.map((mes, index) => (
                                        <Picker.Item
                                            key={`start-${index}`}
                                            label={`${mes}`}
                                            value={(index + 1).toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedEndMonth}
                                    onValueChange={setSelectedEndMonth}
                                >
                                    <Picker.Item label="Hasta" value="12" />
                                    {meses.map((mes, index) => (
                                        <Picker.Item
                                            key={`end-${index}`}
                                            label={`${mes}`}
                                            value={(index + 1).toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <LoadingModal visible={loading} />

                    <View style={styles.countContainer}>
                        <Text style={styles.filteredCountText}>
                            Vendidos: {getFilteredCount('vendido')}
                        </Text>
                        <Text style={styles.filteredCountText}>
                            Disponibles: {getFilteredCount('disponible')}
                        </Text>
                    </View>

                    {/* TabView */}
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get("window").width }}
                        renderTabBar={(props) => {
                            const { key: _, ...restProps } = props;
                            return (
                                <TabBar
                                    {...restProps}
                                    indicatorStyle={{ backgroundColor: "#F108B2", height: 3 }}
                                    style={[styles.tabBar, { backgroundColor: '#3498db' }]}
                                    labelStyle={styles.tabLabel}
                                />
                            );
                        }}
                        swipeEnabled={true}
                        animationEnabled={true}
                        lazy
                        lazyPreloadDistance={1}
                        sceneContainerStyle={styles.sceneContainer}
                    />
                </View>

                {/* Botón para añadir número y exportar a PDF */}
                <View style={styles.exportAñadirContainer}>
                    <View style={[styles.buttonContainer, styles.addButton, styles.buttonLeft]}>
                        <Foundation name="page-export-pdf" size={24} color="#fff" />
                        <TouchableOpacity
                            onPress={handleExportar}
                        >
                            <Text style={styles.addButtonText}>Exportar a PDF</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.buttonContainer, styles.addButton, styles.buttonRight]}>
                        <Entypo name="circle-with-plus" size={24} color="#fff" />
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.addButtonText}>Añadir Número</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
    filteredCountText: { fontSize: 16, color: "#333", textAlign: "center", marginBottom: 4 },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", },
    countContainer: { flexDirection: "row", justifyContent: "center", gap: 80 },
    row: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderColor: "#ddd", width: "100%" },
    rowEven: { backgroundColor: "#f8f8f8" },
    rowOdd: { backgroundColor: "#ffffff" },
    header: { backgroundColor: "#3498db", width: "100%", color: "white" },
    headerText: { fontWeight: "bold", color: "white", textAlign: "center" },
    headerTouchable: { flex: 1, alignItems: "center", justifyContent: "center" },
    cell: { flex: 1, textAlign: "center", paddingHorizontal: 5 },
    nombreCell: { flex: 1 },
    numeroCell: { flex: 0.4 },
    cuotasCell: { flex: 0.4 },
    noData: { textAlign: "center", fontSize: 16, marginTop: 20, color: "black" },
    tabBar: { backgroundColor: "#3498db" },
    tabLabel: { color: "white", fontWeight: "bold" },
    headerContainer: { alignItems: 'flex-end', marginBottom: 20, marginBottom: 16, position: 'relative' },
    filtersContainer: { justifyContent: "space-between", marginTop: 10, paddingHorizontal: 10, },
    searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", height: 50, paddingHorizontal: 10, },
    searchIcon: { marginRight: 10, },
    searchInput: { flex: 1, fontSize: 16, color: "#333", height: 40, },
    pickerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5, },
    pickerWrapper: { flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#ccc", marginHorizontal: 5, borderRadius: 10, },
    picker: { height: 55, },
    menuContainer: { marginButtom: 10, },
    menuContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuText: { fontSize: 16, fontSize: 15, fontWeight: 'bold', color: '#ffff' },
    menuButton: { backgroundColor: "#3498db", paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { height: 2 } },
    menu: { position: 'absolute', top: 50, right: 100, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, width: 180, elevation: 5, zIndex: 100, justifyContent: 'center', alignItems: 'center', },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, gap: 10 },
    exportAñadirContainer: { flexDirection: "row", width: "100%", justifyContent: 'space-between', alignItems: 'center', },
    buttonContainer: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, },
    addButton: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: "#3498db", alignItems: 'center', justifyContent: 'center', elevation: 5, },
    addButtonText: { color: "white", fontSize: 15, fontWeight: "bold", textAlign: 'center', },
    buttonLeft: { borderRightColor: "#fff", borderRigthWidth: 1, },
    buttonRight: { borderLeftColor: "#fff", borderLeftWidth: 1, },
});

export default HomeScreen;