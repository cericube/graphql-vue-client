// Vue 애플리케이션 진입점 (main.ts)
// 애플리케이션의 핵심 초기화 로직을 담당한다.

import { createApp, h } from "vue";
import "./style.css"; // 전역 스타일 파일 불러오기
import App from "./App.vue"; // 루트 컴포넌트

// Apollo Client 인스턴스 및 Vue Apollo 연동 관련
import { apolloClient } from "./apollo/client";
import { DefaultApolloClient } from "@vue/apollo-composable";

// Vue Router 인스턴스
import { router } from "./router";

// Vue 애플리케이션 생성
const app = createApp({
  // setup 함수 안에서 h(App)을 반환하여 App.vue를 루트로 렌더링
  setup() {
    return () => h(App);
  },
});

// Vue Router 등록
app.use(router);

// Vue 전역에 Apollo Client 주입
// - @vue/apollo-composable의 useQuery, useMutation 등에서 자동으로 참조할 수 있음
app.provide(DefaultApolloClient, apolloClient);

// 애플리케이션을 #app DOM 요소에 마운트
app.mount("#app");

