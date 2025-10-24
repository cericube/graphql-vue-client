<template>
  <section class="post-list">
    <h1 class="heading">📬 최신 게시글 목록</h1>
    
    <!-- 수동 갱신 버튼 -->
    <button @click="refreshPosts" class="refresh-button">
      🔄 새로고침
    </button>

    <!-- 로딩 중 -->
    <div v-if="loading" class="loading">불러오는 중...</div>

    <!-- 에러 -->
    <div v-else-if="error" class="error">
      에러 발생: {{ error.message }}
    </div>

    <!-- 게시글 리스트 -->
    <ul v-else class="post-items">
      <li v-for="post in posts" :key="post.id" class="post-item">
        <h2 class="post-title">{{ post.title }}</h2>
        <p class="post-likes">❤️ {{ post.likeCount }} 좋아요</p>
        <p class="post-content">{{ post.content }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import { gql } from '@apollo/client/core'

const GET_POST_LIST = gql`
  query GetPostList {
    posts {
      id
      title
      content
      likeCount
    }
  }
`

const { result, loading, error, refetch } = useQuery(GET_POST_LIST, {
  fetchPolicy: 'cache-and-network',
})

const posts = computed(() => result.value?.posts ?? [])

function refreshPosts() {
  refetch()
}
</script>

<style scoped>
.post-list {
  padding: 20px;
  max-width: 720px;
  margin: 0 auto;
}

.heading {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.loading {
  color: gray;
}

.error {
  color: red;
  font-weight: bold;
}

.post-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  padding-bottom: 12px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 16px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.post-likes {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.post-content {
  font-size: 14px;
  line-height: 1.4;
}

.refresh-button {
  margin-top: 20px;
  padding: 10px 16px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: #005fa3;
}
</style>
