# BluedotFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

This repository contains the frontend application for the Bluedot (ReGen) Project. It is a modern Single Page Application (SPA) built with Angular that provides dedicated interfaces for Patients, Doctors, and Administrators.

The application integrates interactive maps for location-based doctor discovery, comprehensive appointment management, and a responsive, component-driven UI.

---

## 🛠 Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Angular 21 |
| **Styling & UI Components** | PrimeNG 21, Bootstrap 5.3, AdminLTE 4 |
| **Icons & Theming** | PrimeIcons, PrimeUI Themes |
| **Mapping & Geolocation** | Leaflet 1.9 |
| **State Management** | RxJS |
| **Testing** | Vitest & JSDOM |
| **Formatting** | Prettier |

---

## ✨ Key Features

* **Role-Based Workspaces:** Dedicated route modules, layouts, and route guards (`admin-only`, `doctor-only`, `patient-only`) ensure users only see and access what they are authorized to.
* **Interactive Map Discovery:** Utilizes **Leaflet** alongside the Nominatim OpenStreetMap service to allow patients to visually search for nearby doctors and clinics.
* **Rich UI Components:** Leverages **PrimeNG** and **Bootstrap 5** for accessible, data-rich components like data tables, calendars for booking, and interactive forms.
* **Admin Dashboard:** Integrates **AdminLTE** for a clean, professional administrative interface to manage the platform.
* **Secure Communications:** Employs HTTP Interceptors to attach JWT tokens to outbound requests and handle 401/403/404/500 error routing seamlessly.

---

## 📂 Project Structure

The codebase is organized using a feature-based architecture to maintain scalability and clean separation of concerns:

* **`src/app/core/`**: Singleton services, application-wide layouts (Header, Footer, Logo, Cookies), and configuration.
* **`src/app/shared/`**: Reusable UI components (Paginators, Error Pages, Appointment Cards), domain models/interfaces, and utility guards/interceptors.
* **`src/app/features/`**: The core application modules divided by user personas:
  * **`/visitor`**: Landing pages, Login, Registration, and About pages.
  * **`/patient`**: Doctor search results, appointment booking, and patient account management.
  * **`/doctor`**: Availability management, appointment dashboards, and profile settings.
  * **`/admin`**: System administration dashboards.
* **`src/environments/`**: Environment-specific configuration variables (e.g., API base URLs).

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (LTS recommended)
* [npm](https://www.npmjs.com/) (v11+ as defined in packageManager)
* The Bluedot Backend API running locally.

### 1. Installation
Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd bluedot-frontend
npm install
```

### 2. Configuration
Ensure your environment files are pointing to your local backend API. Check src/environments/environment.development.ts and update the API URL if necessary:
```json
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5228/api' // Replace with your backend URL
};
```

### 3. Running the Development Server
Start the Angular CLI development server:
```json
npm start
```
Navigate to http://localhost:4200/ in your browser. The application will automatically reload if you change any of the source files.

### 4. Running Tests
This project uses Vitest for unit testing. To execute the test suite, run:

```json
npm run test
```

### 5. Building for Production
To build the project for production environments:

```
npm run build
```
The build artifacts will be stored in the dist/ directory, optimized and ready to be served by a web server.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
