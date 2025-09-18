// src/ch27/LikeUpdateExample.vue
<template>
    <div class="container">
        <h1 class="title">Apollo 캐시 직접 갱신 예제</h1>
        <p class="description">
            아래 게시글의 좋아요 버튼을 클릭하면, 서버 응답을 기다리지 않고 즉시 UI가 업데이트되는 것을 확인할 수 있습니다.
            두 가지 다른 캐시 갱신 방식을 비교해보세요.
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
// Vue.js와 Apollo를 함께 사용한다면 **@apollo/client/core **에서 gql을 import하는 게 좋습니다.
import { gql } from '@apollo/client/core';

const GET_POSTS = gql`
  query GetPostsByUser($userId: Int!) {
    postsByUser(userId: $userId) {
      id
      title
      likeCount
    }
  }
`


const INCREASE_LIKE = gql`
  mutation IncreaseLike($postId: Int!) {
    increasePostLike(postId: $postId) {
      id
      likeCount
    }
  }
`

const POST_FRAGMENT = gql`
  fragment PostLikeFragment on Post {
    id
    likeCount
  }
`

const userId = 1

//const posts = ref<{ id: number; title: string; author: { id: number; nickname: string } }[]>([])
// 와 같이 타입 명시적으로 지정하는 대신 any[]로 간단히 처리
const posts = ref<any[]>([])

const { result } = useQuery(GET_POSTS, { userId })

watch(result, (value) => {
    if (value?.posts) {
        posts.value = value.posts
    }
})

const client = useApolloClient().client

// writeQuery 방식
const {
    mutate: mutateWithQuery,
    onDone: onDoneQuery,
    onError: onErrorQuery
} = useMutation(INCREASE_LIKE)

onDoneQuery(({ data }) => {
    const updated = data?.increasePostLike
    if (!updated) return

    const cacheData = client.readQuery({ query: GET_POSTS })
    if (!cacheData) return

    const updatedPosts = cacheData.posts.map((p: any) =>
        p.id === updated.id ? { ...p, likeCount: updated.likeCount } : p
    )

    client.writeQuery({
        query: GET_POSTS,
        data: { posts: updatedPosts }
    })
})

onErrorQuery((error) => {
    console.error('writeQuery 좋아요 실패:', error)
})

const likeWithWriteQuery = (postId: number) => {
    mutateWithQuery({ postId })
}

// writeFragment 방식
const {
    mutate: mutateWithFragment,
    onDone: onDoneFragment,
    onError: onErrorFragment
} = useMutation(INCREASE_LIKE)

onDoneFragment(({ data }) => {
    const updated = data?.increasePostLike
    if (!updated) return

    const cacheId = client.cache.identify({
        __typename: 'Post',
        id: updated.id
    })

    client.writeFragment({
        id: cacheId,
        fragment: POST_FRAGMENT,
        data: updated
    })

})

onErrorFragment((error) => {
    console.error('writeFragment 좋아요 실패:', error)
})

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