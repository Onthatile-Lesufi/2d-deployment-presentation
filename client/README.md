# 🛡️ Spirited Sign-In – Creative Auth + E-Commerce Platform 🦒🍷

A full-stack MERN web app that blends creative authentication, live product browsing, a cart and checkout system, chatbot support, and interactive review ratings — all in a single branded platform built for real-world users.

> 📚 Developed as part of Open Window's Creative Computing curriculum.  
> 🎓 Intended for personal portfolio and educational purposes only.

---

## 📑 Table of Contents

1. [About the Project](#1-about-the-project)  
   1.1 [Project Description](#11-project-description)  
   1.2 [Built With](#12-built-with)  
2. [Getting Started](#2-getting-started)  
   2.1 [Prerequisites](#21-prerequisites)  
   2.2 [How to Install](#22-how-to-install)  
3. [Features & Usage](#3-features--usage)  
4. [Demonstration](#4-demonstration)  
5. [Architecture / System Design](#5-architecture--system-design)  
6. [Testing](#6-testing)  
7. [Highlights & Challenges](#7-highlights--challenges)  
8. [Roadmap / Future Improvements](#8-roadmap--future-improvements)  
9. [Contributing & License](#9-contributing--license)  
10. [Authors & Contact Info](#10-authors--contact-info)  
11. [Acknowledgements](#11-acknowledgements)

---

## 1. 📦 About the Project

### 1.1 Project Description

**Spirited Sign-In** challenges conventional logins with a mini-game where users sort virtual bottles to authenticate. The platform expands into a full e-commerce experience — supporting products, reviews, a cart system, real-time chat assistant, and animations throughout.

**Who is it for?**  
- UX-focused developers  
- Creative coders & designers  
- Portfolio reviewers & academic staff

**Why it exists:**  
To showcase how authentication, UX/UI, and full-stack logic can be reimagined for engagement and usability.

---

### 1.2 Built With

- **Frontend:** React, Bootstrap, Masonry Layout, Custom CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB, Mongoose  
- **Auth:** JWT, bcrypt  
- **Chatbot:** React + Socket.io  
- **Docs:** Swagger + API schema  
- **Other:** Multer (uploads), Nodemailer (checkout email)

---

## 2. 🚀 Getting Started

### 2.1 Prerequisites

- Node.js v18+  
- MongoDB Atlas Account  
- Gmail Account (for confirmation emails)  
- Git

---

### 2.2 How to Install

```bash
# Clone the repo
git clone https://github.com/AngievR05/mern_liquor.git
cd mern_liquor/creative-auth-bartender

# Install backend dependencies
cd server
npm install

# Setup environment variables
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS

# Start backend
npm run dev

# Install frontend dependencies
cd ../client
npm install
npm start

### Visit the app at:
[http://localhost:3000](http://localhost:3000)

---

## 3. ✨ Features & Usage

| Area              | Features                                                                 |
|-------------------|--------------------------------------------------------------------------|
| 🔐 Auth            | Game login + accessible fallback                                         |
| 🛍 Products        | View, add, edit, delete products with image upload support               |
| 💬 Reviews         | Add star ratings (1–5 in 0.25 steps) and comments per product            |
| 🛒 Cart & Checkout | Local cart, quantity control, order saving, validation, email receipt    |
| 🤖 Chat Assistant  | Bot with typing delay, routing to pages, smart replies, iOS-style UI     |
| 📄 Admin API       | Swagger UI: `/api-docs`                                                   |

---

### 📸 Screenshots

*(Add screenshots of: Game login screen, Store page, Cart, and Chat UI)*

---

## 4. 🎥 Demonstration

**[Insert video demo link here]**

**Covers:**

- Registering and logging in  
- Spirited Sign-In in action  
- Cart + checkout + confirmation email  
- Live chatbot  
- Admin product management  

---

## 5. 🧠 Architecture / System Design

- React handles UI with React Context for Cart  
- Node/Express REST API for all routes  
- MongoDB Atlas stores users, products, reviews, orders  
- Multer saves product images to `client/public/uploads`  
- Nodemailer sends confirmation email from checkout  
- WebSocket (via Socket.io) handles chatbot messages  

---

## 6. 🧪 Testing

Manual unit testing completed for:

- ✅ Game logic  
- ✅ Auth token logic  
- ✅ Cart totals  
- ✅ Order model  

> ℹ️ *Plan to add Cypress or Vitest for automated testing in the future.*

---

## 7. ⚡ Highlights & Challenges

| Highlights                          | Challenges                                           |
|-------------------------------------|------------------------------------------------------|
| Spirited Sign-In game concept       | Uploading images client-side → saving to `uploads`  |
| Review system with rating UX        | Bot typing delays + routing to pages                |
| Cart persistence using localStorage | Handling empty carts and invalid cards              |
| Autocomplete search bar             | Styling the chat to feel native (iOS vibes)         |

---

## 8. 🔭 Roadmap / Future Improvements

- [ ] User dashboard (view past orders)  
- [ ] Product wishlist  
- [ ] Upload profile image to database  
- [ ] Admin-only product access  
- [ ] Chatbot memory (session-based tracking)  
- [ ] Deploy to Render, Vercel, or Netlify  

---

## 9. 🤝 Contributing & License

### Contributing

Contributions are welcome!  

```bash
git checkout -b feature/cool-feature
git commit -m "Added something awesome"
git push origin feature/cool-feature
Then open a pull request.

---

## 📜 License

This project is **not open source** and is intended for **educational portfolio use only**.

© Bug Squashers 2025. All rights reserved.  
*No redistribution or commercial use permitted.*

---

## 10. 👩‍💻 Authors & Contact Info

**Angie van Rooyen**  
📧 Email: [241077@virtualwindow.co.za](mailto:241077@virtualwindow.co.za)  
🔗 GitHub: [AngievR05](https://github.com/AngievR05)

**Xander Poalses**  
📧 Email: [241322@virtualwindow.co.za](mailto:241322@virtualwindow.co.za)  
🔗 GitHub: [241322](https://github.com/241322)

**Dhiali Chetty**  
📧 Email: [231299@virtualwindow.co.za](mailto:231299@virtualwindow.co.za)  
🔗 GitHub: [Dhiali](https://github.com/Dhiali)

**Tsungai Katsuro**  
📧 Email: [tsungai@openwindow.co.za](mailto:tsungai@openwindow.co.za)  
🔗 GitHub: [TsungaiKats](https://github.com/TsungaiKats)


---

## 11. 🙏 Acknowledgements

- Open Window Creative Computing Faculty  
- Stack Overflow, GitHub Copilot, MDN  
- NodeMailer + Socket.io Docs  
- The React community  
- Bugs squashed, lessons learned 🐞

> 💡 *“Documentation is the difference between a side project and a usable product.”*  
> — Every senior dev ever
