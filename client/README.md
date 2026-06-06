# MovieSPA - Workspace Reservation System SPA

MovieSPA is a Single Page Application (SPA) built using JavaScript, Vite, TailwindCSS, and JSON Server. It implements a workspace and movie booking system where users can authenticate, navigate protected routes, and manage bookings fetched from a simulated REST API.

---

## 🚀 Technologies Used

- **Frontend**: JavaScript (ES6+), Vite, TailwindCSS
- **Backend (Mock API)**: JSON Server, Concurrently
- **Libraries**: SweetAlert2 (alerts), Crypto-JS (SHA256 hashing)

---

## 📂 Project Structure

```txt
src
├── assets
├── components
│   ├── alerts.js
│   ├── dropdown.js
│   └── navbar.js
├── router
│   ├── router.js
│   └── routes.js
├── services
│   ├── api.service.js
│   ├── auth.service.js
│   ├── movie.service.js
│   ├── reservation.service.js
│   ├── theme.service.js
│   └── users.service.js
├── styles
│   └── global.css
├── utils
│   ├── crypto.util.js
│   ├── forms.util.js
│   └── validators.util.js
├── views
│   ├── auth
│   │   ├── login.js
│   │   └── register.js
│   ├── movies
│   │   ├── index.js
│   │   ├── new.js
│   │   └── movieView.js
│   ├── admin.js
│   ├── dashboard.js
│   ├── home.js
│   ├── notFound.js
│   └── profile.js
└── main.js
```

---

## 🔑 Features Implemented

### 1. Booking CRUD (Reservations)
- **Create**: Regular users can book tickets directly from the movies catalog. The system validates ticket availability and subtracts seats dynamically.
- **Read**:
  - *Regular users*: View their active reservations on the Home page, and all reservations (including canceled ones) in the dashboard history.
  - *Admin users*: View all reservations in the system, with details of the registered user.
- **Update**: Regular users can cancel their bookings. Admin users can cancel or delete bookings, which automatically returns the seats to the movie showtime's capacity.
- **Delete**: Admins can permanently delete any reservation from the database.

### 2. User CRUD & Authentication (Logins)
- **Login & Register**: Custom validation fields with email uniqueness checks and password length requirements. Supports both plain text and SHA256 hashed password verification.
- **Profile Management**: Current users can view and edit their own credentials (name, email, password) at the `/profile` view.
- **Admin Management**: Admins have a management panel at `/admin` to list all registered users, create new users, modify roles/emails, reset passwords, or delete accounts securely.

### 3. Movie CRUD (Admin Only)
- **Read Catalog**: Users view active movie screenings in a grid to select and book tickets. Admins view a detailed administration table.
- **Manage Screenings**: Admins can add new movies, cancel showings, or modify movie capacity.
- **Capacity Calculation**: When editing capacity, the system dynamically recalculates availability without breaking active user bookings.

---

## 🛠️ Configuration & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Run the application
Run both Vite and JSON Server concurrently:
```bash
npm run dev
```

### 3. Test Credentials
- **Admin**:
  - Email: `admin@test.com`
  - Password: `A123456`
- **User**:
  - Email: `user@test.com`
  - Password: `A123456`
