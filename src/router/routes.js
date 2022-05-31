const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      { path: "", component: () => import("pages/DashboardPage.vue") },
      { path: "tires", component: () => import("pages/TirePage.vue") },
      { path: "m-tubes", component: () => import("pages/MtubePage.vue") },
      { path: "bikes", component: () => import("pages/BikePage.vue") },
      { path: "users", component: () => import("pages/UserPage.vue") },
    ],
  },
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
