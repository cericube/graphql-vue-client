// Vue Router 설정 (router/index.ts)
// 애플리케이션의 라우팅 규칙과 네비게이션 방식을 정의한다.

import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue"; // 루트 경로("/")에 매핑될 페이지 컴포넌트
import PostList from "@/ch22/PostList.vue";
import PostForm from "@/ch23/PostForm.vue";
import PostCreateForm from "@/ch24/PostCreateForm.vue";
import PostDetailWithComments from "@/ch25/PostDetailWithComments.vue";
import CacheModify from "@/ch26/CacheModify.vue";
import LikeUpdateExample from "@/ch27/LikeUpdateExample.vue";
import PostListView from "@/ch28/PostListView.vue";
import FetchPolicyPostListView from "@/ch29/FetchPolicyPostListView.vue";

// 라우트 목록 정의
// - 각 라우트 객체는 URL 경로(path), 라우트 이름(name), 연결된 컴포넌트(component)를 가진다.
const routes = [
  {
    path: "/", // 접속 경로 (http://localhost:5173/ 같은 형태)
    name: "home", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: HomePage, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch22", // 접속 경로 (http://localhost:5173/ch22)
    name: "ch22", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: PostList, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch23", // 접속 경로 (http://localhost:5173/ch23)
    name: "ch23", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: PostForm, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch24", // 접속 경로 (http://localhost:5173/ch24)
    name: "ch24", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: PostCreateForm, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch25", // 접속 경로 (http://localhost:5173/ch25)
    name: "ch25", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: PostDetailWithComments, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch26", // 접속 경로 (http://localhost:5173/ch26)
    name: "ch26", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: CacheModify, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch27", // 접속 경로 (http://localhost:5173/ch27)
    name: "ch27", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: LikeUpdateExample, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch28", // 접속 경로 (http://localhost:5173/ch28)
    name: "ch28", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: PostListView, // 매칭되는 Vue 컴포넌트
  },
  {
    path: "/ch29", // 접속 경로 (http://localhost:5173/ch28)
    name: "ch29", // 라우트 이름 (네비게이션, 프로그래밍 라우팅 시 사용)
    component: FetchPolicyPostListView, // 매칭되는 Vue 컴포넌트
  },
];

// 라우터 인스턴스 생성
// - history 모드는 브라우저의 History API를 사용하여 깔끔한 URL 제공 (ex: /about)
// - routes 배열을 기반으로 네비게이션 로직이 동작
export const router = createRouter({
  history: createWebHistory(), // HTML5 History 모드
  routes, // 위에서 정의한 라우트 매핑
});
