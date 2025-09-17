// src/apollo/client.ts
// Vue 애플리케이션에서 사용할 Apollo Client 인스턴스를 정의하는 파일
// - Apollo Client: GraphQL 서버와 통신하고, 쿼리 결과를 캐싱/관리하는 핵심 라이브러리
// - InMemoryCache: Apollo의 기본 캐시 구현체. 동일한 쿼리 결과를 메모리에 저장하여 네트워크 요청 최소화
// - createHttpLink: GraphQL 서버와의 HTTP 연결을 설정하는 함수

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";

//브라우저 콘솔에 출력
console.log(import.meta.env.VITE_GRAPHQL_URI);

// HTTP Link 생성
// - GraphQL 서버의 엔드포인트를 지정
// - 클라이언트는 모든 GraphQL 요청(query, mutation 등)을 이 경로로 전송
// - 기본적으로 fetch API를 이용하며, 추가 옵션(headers, credentials 등)을 넣을 수 있음
const httpLink = createHttpLink({
  //uri: "http://localhost:4000/graphql", // GraphQL 서버 주소 (GraphQL Yoga 기준)

  // Vite 환경 변수 사용 (prefix: VITE_)
  // import.meta.env는 Vite에서 제공하는 전역 객체
  uri: import.meta.env.VITE_GRAPHQL_URI, // .env에 정의된 GraphQL 서버 주소
});

// Apollo Client 인스턴스 생성
// - link: GraphQL 요청을 보낼 네트워크 레이어 (여기서는 httpLink 사용)
// - cache: 쿼리 결과를 저장하고 재사용하는 캐시 전략 (기본 InMemoryCache)
//   * 캐시 덕분에 동일한 쿼리를 다시 요청할 때 네트워크 대신 캐시 데이터를 반환
//   * 캐시 키는 기본적으로 객체의 __typename + id 조합으로 관리됨
// - 필요 시 에러 핸들링, Apollo Link 체이닝, 인증 토큰 주입 등 확장이 가능
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
