# College Uniform Ordering Platform

A full-stack web application for ordering college uniforms with Stripe payments and Cloudinary image uploads.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, Axios, React Router DOM, React Hot Toast, Stripe.js
- Backend: Node.js, Express.js, mysql2
- Database: MySQL
- Payments: Stripe (test mode)
- Images: Cloudinary

---

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- A Stripe account (test keys)
- A Cloudinary account

---

## 1. Database Setup

Log in to MySQL and run the schema file:

```bash
mysql -u root -p < schema.sql
```

This creates the `college_uniform_db` database with all required tables and seed data for categories.

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in all values:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_uniform_db
JWT_SECRET=any_long_random_string
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Where to get keys

**Stripe:**
- Go to https://dashboard.stripe.com/test/apikeys
- Copy the Secret key (starts with `sk_test_`)

**Cloudinary:**
- Go to https://cloudinary.com/console
- Copy Cloud Name, API Key, and API Secret from the dashboard

Then install and run:

```bash
npm install
npm run dev
```

Backend runs on http://localhost:5000

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Stripe Publishable Key:**
- Go to https://dashboard.stripe.com/test/apikeys
- Copy the Publishable key (starts with `pk_test_`)

Then install and run:

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:3000

---

## 4. Usage

### Admin Account
Register a new account and select the "Admin" role on the registration page.

### Student Account
Register with the "Student" role.

### Admin Features
- Manage colleges (add/edit/delete with image upload)
- Manage products (add/edit/delete with image upload)
- View and update order statuses

### Student Features
- Browse colleges and their uniforms
- Add items to cart
- Place orders with Stripe test payment
- View order history

### Stripe Test Card
Use card number `4242 4242 4242 4242` with any future expiry date and any 3-digit CVC.

---

## Project Structure

```
/
├── schema.sql
├── README.md
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── collegeController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   └── routes/
│       ├── auth.js
│       ├── colleges.js
│       ├── products.js
│       └── orders.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Colleges.jsx
            ├── Products.jsx
            ├── Cart.jsx
            ├── Orders.jsx
            └── AdminPanel.jsx
```
