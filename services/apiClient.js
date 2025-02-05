const API_URL = 'https://script.google.com/macros/s/AKfycbz7eidu5BYm2I3wvBY0GAQOVkf8EsduqYBofR6TX6n5jtdmADFtAkBAv_2-xKj6blf4/exec';

// Función genérica para hacer peticiones a la API
const apiRequest = async (accion, parametros) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accion, parametros }),
        });
        const data = await response.json();
        console.log(`Respuesta de ${accion}:`, data);
        return data;
    } catch (error) {
        console.error(`Error en ${accion}:`, error);
        return { mensaje: `Error al procesar la solicitud de ${accion}` };
    }
};

// Función para crear un vendedor
export const crearVendedor = (nombre, email, password) => 
    apiRequest('crearVendedor', { nombre, email, password });

// Funcion para validar codigo de verificacion
export const validarCodigo = (email, codigo) => 
    apiRequest('validarCodigo', { email, codigo });

// Función para autenticar un vendedor
export const autenticarVendedor = (email, password) => 
    apiRequest('autenticarVendedor', { email, password });

// Función para agregar números disponibles a un vendedor
export const agregarNumerosDisponibles = (id_vendedor, numeros) => 
    apiRequest('agregarNumeros', { id_vendedor, numeros });

// Función para editar un número asociado a un vendedor
export const editarNumero = (id_vendedor, numero, cliente, estado, cuotas_pagadas) => 
    apiRequest('editarNumero', { id_vendedor, numero, cliente, estado, cuotas_pagadas });

// Función para eliminar un número de un vendedor
export const eliminarNumero = (id_vendedor, numero) => 
    apiRequest('eliminarNumero', { id_vendedor, numero });

// Función para obtener los números de un vendedor
export const obtenerNumerosPorVendedor = (id_vendedor) => 
    apiRequest('obtenerNumeros', { id_vendedor });