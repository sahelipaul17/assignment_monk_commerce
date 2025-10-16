# Coupon Management System

A backend assignment for **Monk Commerce** focused on implementing a complete **coupon management system**.  
Developed using **Node.js (ES Modules)**, **Express.js**, and **MongoDB**, with unit tests powered by **Jest** and **Supertest**.

---

## Overview

This service handles creation, management, and application of different types of coupons for an e-commerce platform.  
It supports:

- **Cart-wise** coupons (discounts applied to total cart value)
- **Product-wise** coupons (discounts on specific items)
- **Buy X Get Y (BXGY)** offers
- **Coupon expiration** logic
- **Applicable coupon filtering** based on the current cart
- **Comprehensive unit tests** for key business logic

---

## Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Node.js (ESM)** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **Jest + Supertest** | Unit & integration testing |
| **dotenv** | Environment variable management |

---

## Project Structure

assignment_monk_commerce/
├── src/
│ ├── config/
│ │ └── db.js # MongoDB connection logic
│ ├── controllers/
│ │ └── coupon.controller.js # All coupon-related business logic
│ ├── models/
│ │ └── coupon.model.js # Mongoose schema for coupons
│ ├── routes/
│ │ └── coupon.route.js # Coupon routes
│ └── server.js # Express app setup and bootstrap
├── tests/
│ └── coupon.test.js # Jest + Supertest unit tests
├── .env # Mongo URI and other env vars
├── package.json
├── jest.config.js # Jest configuration
├── assignment_monk_commerce.postman_collection.json # Postman collection for API testing
└── README.md

### Clone the repository

```bash
git clone https://github.com/<your-username>/monk-commerce-coupons.git

npm install 

create .env file and add the following variables

MONGO_URI=your_mongodb_uri
PORT=your_port

npm run dev

Server runs by default on:
http://localhost:your_port


## API Endpoints

### Coupon CRUD


Method	     Endpoint	                     Description
POST	     /api/coupons	                     Create a new coupon
GET	      /api/coupons	                     Get all coupons
GET	      /api/coupons/:id	                 Get a single coupon by ID
PUT	      /api/coupons/:id	                 Update coupon details
DELETE	   /api/coupons/:id	                 Delete a coupon

Applicable Coupons

Method	     Endpoint	                     Description
POST	     /api/coupons/applicable-coupons	 Get applicable coupons for the given cart

Apply Coupon

Method	     Endpoint	                     Description
POST	     /api/coupons/apply-coupon/:id	 Apply the selected coupon and return updated cart with discounted totals



## Running Tests

The project includes unit tests for:

Coupon creation
Fetching coupons
Filtering expired coupons
Applying expired coupons

## To run tests
npm test


#Tests are powered by Jest and use mongodb-memory-server,so they run entirely in-memory 

## Expected output:

```bash

✓ should create a new cart-wise coupon
✓ should fetch all coupons
✓ should skip expired coupons in applicable list
✓ should reject applying an expired coupon


## Error Handling

### All routes include proper error handling:

400 for invalid input

404 for missing coupons

500 for server errors