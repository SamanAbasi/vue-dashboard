import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import store from "@/store";
import * as paths from "@/routes";
import AppLayout from "@/components/AppLayout/AppLayout.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: paths.HOME,
    component: AppLayout,
    children: [
      {
        path: "", // Empty path for the default child route
        name: "home",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home/HomeView.vue"),
      },
      {
        path: paths.CREATE_ARTICLE,
        name: "new-article",
        component: () =>
          import(
            /* webpackChunkName: "createArticle" */ "@/views/newArticle/NewArticleView.vue"
          ),
      },
      {
        path: paths.ARTICLE,
        name: "article",
        component: () =>
          import(
            /* webpackChunkName: "article" */ "@/views/Article/ArticleView.vue"
          ),
      },
    ],
  },
  {
    path: paths.LOGIN,
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/login/LoginView.vue"),
  },
  {
    path: paths.REGISTER,
    name: "register",
    component: () =>
      import(
        /* webpackChunkName: "register" */ "@/views/register/RegisterView.vue"
      ),
  },
];

const router = new VueRouter({
  routes,
});

// Add a global navigation guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters.isLoggedIn;

  if (to.name === "login" && isAuthenticated) {
    // Redirect authenticated users away from the login page
    next({ name: "home" });
    return;
  }
  if (to.name === "register" && isAuthenticated) {
    // Redirect authenticated users away from the registration page
    next({ name: "home" });
    return;
  }

  if (to.name !== "login" && to.name !== "register" && !isAuthenticated) {
    // Redirect non-authenticated users to the login page
    next({ name: "login" });
    return;
  }

  // Allow navigation for other cases
  next();
});

window.addEventListener("storage", checkLocalStorage);

function checkLocalStorage() {
  const token = localStorage.getItem("token");

  // Check if the token is null (localStorage cleared)
  if (token === null) {
    // Remove the event listener to prevent further checks
    window.removeEventListener("storage", checkLocalStorage);
    // Reload the page to force a refresh
    window.location.reload();
  }
}

export default router;
