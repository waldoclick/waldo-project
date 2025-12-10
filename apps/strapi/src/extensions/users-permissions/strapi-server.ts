// /**
//  * Strapi Server Extension for Users-Permissions
//  * ============================================
//  *
//  * This file extends the default Strapi users-permissions plugin with custom functionality
//  * for user management, profile updates, and related features. It provides a comprehensive
//  * set of endpoints for handling user-related operations in the application.
//  *
//  * The extension is organized into three main sections:
//  * 1. User Profile Management
//  * 2. Profile Update Operations
//  * 3. User Content Management
//  *
//  * Each section contains related endpoints that handle specific aspects of user functionality.
//  *
//  * @module strapi-server
//  */

// import {
//   getUserData,
//   getUserDataById,
//   getUserDataWithFilters,
// } from "./controllers/userController";

// import { updateUser } from "./controllers/userUpdateController";
// import { getUserAds } from "./controllers/userAdsController";
// import { updateUsername } from "./controllers/usernameUpdateController";
// import { updateAvatar } from "./controllers/avatarUpdateController";
// import { updateCover } from "./controllers/coverUpdateController";
// import { getUserOrders } from "./controllers/userOrdersController";

// /**
//  * Plugin Extension Function
//  * ------------------------
//  * This function extends the Strapi users-permissions plugin with custom routes and controllers.
//  * It modifies the default plugin behavior to add new functionality and endpoints.
//  *
//  * @param {Object} plugin - The Strapi users-permissions plugin instance
//  * @returns {Object} The modified plugin instance
//  */
// export default function (plugin) {
//   // Debug log to verify the extension is loading
//   console.log("🚀 Users-Permissions extension is loading...");

//   // Initialize routes if they don't exist
//   if (!plugin.routes) {
//     plugin.routes = {};
//   }
//   if (!plugin.routes["content-api"]) {
//     plugin.routes["content-api"] = { routes: [] };
//   }
//   if (!plugin.routes["content-api"].routes) {
//     plugin.routes["content-api"].routes = [];
//   }

//   // User Profile Endpoints
//   // ---------------------
//   // These endpoints handle basic user profile operations and data retrieval

//   // GET /users/me - Get current user's profile data
//   // Returns the complete profile information of the authenticated user
//   plugin.controllers.user.me = getUserData;

//   // GET /users/{id} - Get specific user's profile by ID
//   // Retrieves detailed profile information for a specific user
//   plugin.controllers.user.findOne = getUserDataById;

//   // GET /users - Get users with optional filters
//   // Returns a list of users that match the specified filter criteria
//   plugin.controllers.user.find = getUserDataWithFilters;

//   // Profile Update Endpoints
//   // ----------------------
//   // These endpoints handle all profile modification operations

//   // PUT /users/me - Update current user's profile data
//   // Allows users to modify their own profile information
//   // plugin.controllers.user.updateMe = updateUser;

//   // PUT /users/username - Update user's username
//   // Handles username changes with validation and uniqueness checks
//   plugin.controllers.user.updateUsername = updateUsername;

//   // PUT /users/avatar - Update user's profile avatar
//   // Manages profile picture uploads and updates
//   plugin.controllers.user.updateAvatar = updateAvatar;

//   // PUT /users/cover - Update user's profile cover image
//   // Handles cover image uploads and updates
//   plugin.controllers.user.updateCover = updateCover;

//   // User Content Endpoints
//   // --------------------
//   // These endpoints provide access to user-generated content and activities

//   // GET /users/ads - Get all ads created by the user
//   // Returns a list of all advertisements created by the current user
//   plugin.controllers.user.ads = getUserAds;

//   // GET /users/orders - Get all orders made by the user
//   // Retrieves the complete order history for the current user
//   plugin.controllers.user.orders = getUserOrders;

//   // Route Definitions
//   // ---------------
//   // These route definitions map HTTP endpoints to their respective controllers

//   // Profile Update Routes
//   // These routes handle all profile modification requests
//   plugin.routes["content-api"].routes.unshift({
//     method: "PUT",
//     path: "/users/me",
//     handler: "user.updateMe",
//     config: {
//       prefix: "",
//     },
//   });

//   plugin.routes["content-api"].routes.unshift({
//     method: "PUT",
//     path: "/users/username",
//     handler: "user.updateUsername",
//     config: {
//       prefix: "",
//     },
//   });

//   plugin.routes["content-api"].routes.unshift({
//     method: "PUT",
//     path: "/users/avatar",
//     handler: "user.updateAvatar",
//     config: {
//       prefix: "",
//     },
//   });

//   plugin.routes["content-api"].routes.unshift({
//     method: "PUT",
//     path: "/users/cover",
//     handler: "user.updateCover",
//     config: {
//       prefix: "",
//     },
//   });

//   // Content Retrieval Routes
//   // These routes handle requests for user-generated content
//   plugin.routes["content-api"].routes.unshift({
//     method: "GET",
//     path: "/users/ads",
//     handler: "user.ads",
//     config: {
//       prefix: "",
//     },
//   });

//   plugin.routes["content-api"].routes.unshift({
//     method: "GET",
//     path: "/users/orders",
//     handler: "user.orders",
//     config: {
//       prefix: "",
//     },
//   });

//   return plugin;
// }

export default function (plugin) {
  // Return the plugin without any modifications
  // This allows Strapi to use its default controllers and routes
  return plugin;
}
