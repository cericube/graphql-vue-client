<template>
  <div>
    <h1>게시글 목록</h1>
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { GET_POSTS } from './post.queries'
import PostCard from './PostCard.vue'
import { computed } from 'vue'

const { result } = useQuery(GET_POSTS)
const posts = computed(() => result.value?.posts ?? [])
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
</style>
