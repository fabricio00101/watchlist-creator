# Watchlist Creator (Creador de Listas de Películas)

Una aplicación web full-stack para buscar películas y organizar listas de seguimiento ("watchlists") personalizadas. El proyecto implementa una arquitectura cliente-servidor, con un frontend de JavaScript puro y un backend de API REST construido en Python con Flask.

La interfaz de usuario está diseñada con CSS moderno (Flexbox y variables CSS), utilizando una paleta de colores personalizada inspirada en Letterboxd.

## ✨ Características Principales

  * **Búsqueda en vivo:** Se conecta directamente a la **API de TMDb (The Movie Database)** para buscar películas en tiempo real.
  * **Listas Múltiples:** Permite crear, nombrar y gestionar múltiples listas de películas.
  * **Gestión Dinámica:** Añadí películas fácilmente a cualquier lista desde los resultados de búsqueda.
  * **API RESTful:** Un servidor **Flask (Python)** maneja toda la lógica de negocio (crear, obtener y borrar listas, añadir películas).
  * **Eliminación de Listas:** Funcionalidad para borrar listas completas con un solo clic.

## 🛠️ Tecnologías Utilizadas

  * **Frontend:**
      * HTML5 Semántico
      * CSS3 (con variables CSS, Flexbox y Grid)
      * JavaScript (Vanilla JS)
      * Fetch API (para la comunicación con TMDb y el backend)
  * **Backend:**
      * Python
      * Flask (para el servidor web y la API REST)
  * **API Externa:**
      * TMDb (The Movie Database)

## 🚀 Cómo ejecutar el proyecto

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/watchlist-creator.git
    cd watchlist-creator
    ```
2.  **Instalar dependencias de Python:**
    ```bash
    pip install Flask
    ```
3.  **Configurar la API Key:**
      * Obtené una clave de API de [TMDb](https://www.themoviedb.org/documentation/api).
      * Pegá tu clave (API Read Access Token v4) en el archivo `app.js`, en la variable `API_KEY`.
4.  **Iniciar el servidor Backend:**
    ```bash
    python app.py
    ```
5.  **Abrir la aplicación:**
      * Abrí tu navegador y andá a `http://127.0.0.1:5000`
