<!-- src/ch21/PostList.vue -->
<template>
    <div>
        <h2>게시글 목록</h2>

        <!-- refetch() 호출: 수동 새로고침 버튼 -->
        <button @click="refresh">새로고침</button>

        <!-- 로딩 중 상태 표시 -->
        <div v-if="loading">게시글을 불러오는 중입니다...</div>

        <!-- 에러 발생 시 표시 -->
        <!-- <div v-else-if="error">에러 발생: {{ error.message }}</div> -->
        <div v-else-if="error">
            <p>에러 발생: {{ error.message }}</p>

            <ul v-if="error.graphQLErrors.length">
                <li v-for="(gqlError, index) in error.graphQLErrors" :key="index">
                    GraphQL 에러: {{ gqlError.message }}
                </li>
            </ul>

            <div v-if="error.networkError">
                <p>네트워크 에러 발생: 서버에 연결할 수 없습니다.</p>
            </div>
        </div>


        <!-- 데이터가 성공적으로 로드되었을 때 게시글 목록 표시 -->
        <ul v-else>
            <li v-for="post in result?.posts" :key="post.id">
                <strong>{{ post.title }}</strong> -
                <span>{{ post.author.nickname }}</span>
                <small>({{ new Date(post.createdAt).toLocaleDateString() }})</small>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'  // Apollo Client의 useQuery 훅
import { gql } from 'graphql-tag'                  // GraphQL 쿼리 정의용 gql 태그

////////////////////////////////////////////////////////////////
// GraphQL 쿼리 정의: 게시글 목록 조회용
////////////////////////////////////////////////////////////////
// const GET_POSTS = gql`
//   query GetPosts {
//     posts {
//       id
//       title
//       createdAt
//       author {
//         id
//         nickname
//       }
//     }
//   }
// `
// // useQuery 훅 사용: 쿼리 실행 및 상태 추적
// const { result, loading, error, refetch } = useQuery(GET_POSTS)
///////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
// 동적으로 변경될 사용자 ID
//////////////////////////////////////////////////////////////////
const authorId = ref(1) // 초기값 1번 사용자
// 쿼리 정의
const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: Int!) {
    posts(authorId: $authorId) {
      id
      title
      createdAt
      author {
        id
        nickname
      }      
    }
  }
`
// variables는 반응형 상태(ref, reactive)로 전달 가능
const { result, loading, error, refetch } = useQuery(GET_USER_POSTS, () => ({
    authorId: authorId.value,
}))
/////////////////////////////////////////////////////////////////

// 수동 새로고침 함수: refetch() 호출
function refresh() {
    refetch()
}
</script>

<style scoped>
/* 리스트 기본 스타일 제거 */
ul {
    list-style: none;
    padding: 0;
}

/* 게시글 항목 스타일링 */
li {
    margin-bottom: 8px;
    padding: 6px;
    border-bottom: 1px solid #ddd;
}

/* 새로고침 버튼 하단 여백 */
button {
    margin-bottom: 1rem;
}
</style>
