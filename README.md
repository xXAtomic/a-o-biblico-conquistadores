# 📖 ConquiBiblia
## La Expedición Bíblica de los Conquistadores

**ConquiBiblia** es una plataforma interactiva diseñada para que los miembros del Club de Conquistadores completen su plan de lectura del **Año Bíblico (Reina Valera 1960)** con una experiencia moderna, gamificada y motivadora.

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)

---

## ✨ Características Principales

- **📅 Plan de 52 Semanas:** Calendario completo basado en los temas oficiales de la División Sudamericana (DSA).
- **📊 Progreso Visual Dinámico:** Visualización en tiempo real del avance semanal mediante un sistema de llenado de color proporcional en el Dashboard.
- **🏆 Sistema de Logros (Gamer-ready):** Desbloquea personajes bíblicos a medida que avanzas:
  - **Semana 1:** Nivel Daniel
  - **Semana 4:** Nivel David
  - **Semana 8:** Nivel Ester
  - **Semana 16:** Nivel José
  - **Semana 24:** Nivel Moisés
  - **Semana 40:** Nivel Pablo
  - **Semana 52:** ¡Victoria Final!
- **📜 Certificado Oficial:** Generación de certificado de reconocimiento en formato horizontal (Landscape) optimizado para impresión A4, disponible únicamente al completar las 52 semanas.
- **📖 Lector de Biblia Integrado:** Acceso directo a los versículos mediante una API dinámica (RV1960).
- **🎨 Diseño Vanguard Elite:** Interfaz premium con modo oscuro, efectos de vidrio (glassmorphism) y animaciones fluidas.
- **☁️ Sincronización en la Nube (Supabase):** Tu progreso está seguro. Regístrate y recupera tus lecturas en cualquier dispositivo.
- **📥 Modo Ultra-Offline:** Descarga lecturas por adelantado para campamentos o zonas sin señal con un solo toque.
- **🔔 Recordatorios Inteligentes:** Notificaciones diarias automáticas para mantener el hábito de la lectura constante.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 19 + Vite 8
- **Base de Datos & Auth:** Supabase (PostgreSQL)
- **Móvil:** Capacitor 8 (Android e iOS)
- **Notificaciones:** Capacitor Local Notifications
- **API:** Bible API (RV1960) con sistema de caché local.

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/xXAtomic/Conquisbiblia.git
   ```

2. **Entrar al directorio:**
   ```bash
   cd ConquisBiblia
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🗺️ Hoja de Ruta (Roadmap)

- [x] Implementación completa del plan de 52 semanas.
- [x] Sistema de logros e ilustraciones personalizadas.
- [x] Generación de certificado A4 horizontal.
- [x] Integración con Supabase para Sincronización en la Nube.
- [x] Notificaciones push diarias para recordatorios.
- [x] Modo offline con pre-descarga de capítulos.
- [ ] Lanzamiento en Google Play Store (Fase Comercial).
- [ ] Multi-lenguaje (Próximamente).

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la app o añadir nuevas funciones:

1. Haz un Fork del proyecto.
2. Crea una rama para tu función (`git checkout -b feature/NuevaMejora`).
3. Haz un commit de tus cambios (`git commit -m 'Añade nueva mejora'`).
4. Sube la rama (`git push origin feature/NuevaMejora`).
5. Abre un Pull Request.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Siéntete libre de usarlo para bendecir a tu club local.

---

Desarrollado con ❤️ por **AtomicDevs**
