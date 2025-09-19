// src/ch27/LikeUpdateExample.vue
<template>
    <div class="container">
        <h1 class="title">Apollo 캐시 직접 갱신 예제</h1>
        <p class="description">
            아래 게시글의 좋아요 버튼을 클릭하면, 서버 응답을 받은 후 UI가 업데이트되는 것을 확인할 수 있습니다.
            두 가지 다른 캐시 갱신 방식을 비교해보세요
        </p>
        <div v-if="posts.length" class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-card">
                <h2 class="post-title">{{ post.title }}</h2>
                <p class="post-likes">좋아요: {{ post.likeCount }}</p>
                <div class="actions">
                    <button @click="likeWithWriteQuery(post.id)">writeQuery로 좋아요</button>
                    <button @click="likeWithWriteFragment(post.id)">writeFragment로 좋아요</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useMutation, useApolloClient } from '@vue/apollo-composable'
// @apollo/client/core에서 gql을 임포트합니다. Vue.js와 함께 Apollo를 사용할 때 권장되는 방식입니다.
import { gql } from '@apollo/client/core';

// 쿼리 및 뮤테이션을 위한 GraphQL 문서 정의
// GET_POSTS: 특정 작성자(authorId)의 모든 게시글을 가져오는 쿼리입니다. 
// 각 게시글의 id, title, likeCount를 요청합니다.
const GET_POSTS = gql`
  query GetPostsByUser($authorId: Int!) {
    posts(authorId: $authorId) {
      id
      title
      likeCount
    }
  }
`

// INCREASE_LIKE: 특정 게시글(postId)의 좋아요 수를 증가시키는 뮤테이션입니다. 
// 성공 시 업데이트된 게시글의 id와 likeCount를 반환합니다.
const INCREASE_LIKE = gql`
  mutation IncreaseLike($postId: Int!) {
    increasePostLike(id: $postId) {
      id
      likeCount
    }
  }
`

// POST_FRAGMENT: 'Post' 타입 객체의 일부 필드(id, likeCount)를 정의하는 조각(fragment)입니다. 
// 캐시 갱신 시 특정 필드만 부분적으로 업데이트하는 데 사용됩니다.
// 좋아요 수만 갱신할 Fragment 정의
const POST_FRAGMENT = gql`
  fragment PostLikeFragment on Post {
    id
    likeCount
  }
`

const userId = 1

//const posts = ref<{ id: number; title: string; author: { id: number; nickname: string } }[]>([])
// 와 같이 타입 명시적으로 지정하는 대신 any[]로 간단히 처리
// 게시글 목록을 저장할 반응형 변수입니다. 초기에는 빈 배열로 설정됩니다.
const posts = ref<any[]>([])

// useQuery 훅을 사용하여 서버로부터 게시글 데이터를 비동기적으로 가져옵니다.
// 두 번째 인자로 쿼리 변수(authorId)를 전달합니다.
const { result } = useQuery(GET_POSTS, { authorId: userId })

// watch를 사용하여 쿼리 결과(result)가 변경될 때마다 posts 변수를 업데이트합니다.
watch(result, (value) => {
    if (value?.posts) {
        posts.value = value.posts
    }
})

// useApolloClient 훅을 통해 Apollo Client 인스턴스를 가져옵니다. 이를 통해 캐시에 직접 접근할 수 있습니다.
const client = useApolloClient().client
// 표현은 구조 분해 할당(Destructuring Assignment) 문법을 사용
// useApolloClient(): 동일하게 { client, resolveClient } 객체를 반환합니다.
// const { client } = useApolloClient()

// --- writeQuery 방식 캐시 갱신 ---
// useMutation 훅을 사용하여 좋아요 증가 뮤테이션을 실행합니다.
const {
    mutate: mutateWithQuery, // 뮤테이션 실행 함수
    onDone: onDoneQuery,     // 뮤테이션이 성공적으로 완료되었을 때 실행될 콜백
    onError: onErrorQuery    // 뮤테이션 중 에러가 발생했을 때 실행될 콜백
} = useMutation(INCREASE_LIKE)

// 뮤테이션이 성공하면 실행되는 콜백입니다.
onDoneQuery(({ data }) => {
    const updated = data?.increasePostLike
    if (!updated) return // 업데이트된 데이터가 없으면 함수 종료

    //1. 기존 캐시에서 게시글 목록 쿼리 결과 읽기
    const cacheData = client.readQuery({ query: GET_POSTS })
    if (!cacheData) return // 캐시 데이터가 없으면 함수 종료

    // 2. 좋아요 수가 증가된 게시글만 반영한 새 배열 생성
    // 불변성(immutability)을 유지
    const updatedPosts = cacheData.posts.map((p: any) =>
        p.id === updated.id ? { ...p, likeCount: updated.likeCount } : p
    )
   
    // 3. 새로운 배열로 캐시 전체 덮어쓰기
    client.writeQuery({
        query: GET_POSTS,
        data: { posts: updatedPosts }
    })
})

// 에러 발생 시 콘솔에 에러를 출력합니다.
onErrorQuery((error) => {
    console.error('writeQuery 좋아요 실패:', error)
})

// 'writeQuery로 좋아요' 버튼 클릭 시 호출되는 함수입니다. 뮤테이션을 실행합니다.
const likeWithWriteQuery = (postId: number) => {
    mutateWithQuery({ postId })
}

// --- writeFragment 방식 캐시 갱신 ---
// writeQuery 방식과 동일하게 뮤테이션 훅을 사용합니다.
const {
    mutate: mutateWithFragment,
    onDone: onDoneFragment,
    onError: onErrorFragment
} = useMutation(INCREASE_LIKE)

// 뮤테이션이 성공하면 실행되는 콜백입니다.
onDoneFragment(({ data }) => {
    const updated = data?.increasePostLike
    if (!updated) return

    // client.cache.identify()를 사용하여 캐시에서 객체의 고유 식별자(ID)를 생성합니다.
    // GraphQL 응답의 __typename과 id 필드를 기반으로 합니다.
    const cacheId = client.cache.identify({
        __typename: 'Post',
        id: updated.id
    })

    // writeFragment를 사용하여 특정 객체의 특정 필드만 캐시를 업데이트합니다.
    // id: 업데이트할 캐시 객체의 고유 식별자입니다.
    // fragment: 업데이트할 필드를 정의한 GraphQL 조각입니다.
    // data: 업데이트할 데이터입니다.
    client.writeFragment({
        id: cacheId,
        fragment: POST_FRAGMENT,
        data: updated
    })
})

// 에러 발생 시 콘솔에 에러를 출력합니다.
onErrorFragment((error) => {
    console.error('writeFragment 좋아요 실패:', error)
})

// 'writeFragment로 좋아요' 버튼 클릭 시 호출되는 함수입니다.
const likeWithWriteFragment = (postId: number) => {
    mutateWithFragment({ postId })
}
</script>

<style scoped>
.container {
    max-width: 640px;
    margin: auto;
    padding: 2rem;
    font-family: sans-serif;
}

.title {
    font-size: 24px;
    margin-bottom: 1rem;
}

.description {
    margin-bottom: 2rem;
    color: #666;
}

.posts-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.post-card {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.post-title {
    margin: 0 0 0.5rem 0;
    font-size: 18px;
}

.actions button {
    margin-right: 1rem;
    padding: 0.5rem 1rem;
}
</style>