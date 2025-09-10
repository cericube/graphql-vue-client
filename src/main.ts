import { createApp, h } from "vue";
import "./style.css";
import App from "./App.vue";

import { apolloClient } from "./apollo/client";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { router } from "./router";

const app = createApp({
  setup() {
    return () => h(App);
  },
});

app.use(router);
app.provide(DefaultApolloClient, apolloClient);
app.mount("#app");
