<template>
    <div class="form">
        <h2>게시글 입력</h2>
        <input v-model="title" placeholder="제목" />
        <textarea v-model="content" placeholder="내용" />
        <button @click="handleCreate" :disabled="loading">등록</button>

        <h2>마지막 게시글 수정</h2>
        <input v-model="newTitle" placeholder="새 제목" />
        <button @click="handleUpdate" :disabled="loading">제목 수정</button>

        <h2>마지막 게시글 삭제</h2>
        <button @click="handleDelete" :disabled="loading">삭제</button>

        <p v-if="error" class="error">에러: {{ error.message }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// Vue.js와 Apollo를 함께 사용한다면 **@apollo/client/core **에서 gql을 import하는 게 좋습니다.
import { gql } from '@apollo/client/core';
import { useMutation } from '@vue/apollo-composable'

const title = ref('')
const content = ref('')
const newTitle = ref('')
const lastPostId = ref<number | null>(null)

// 1. 게시글 등록
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
    }
  }
`
const { mutate: createPost, loading, error } = useMutation(CREATE_POST)

async function handleCreate() {
    try {
        const res = await createPost({
            input: {
                title: title.value,
                content: content.value,
                authorId: 1, // 로그인 사용자로 대체
            },
        })
        const post = res?.data?.createPost
        if (post) {
            alert(`"${post.title}" 게시글이 등록되었습니다.`)
            lastPostId.value = post.id
            title.value = ''
            content.value = ''
        }
    } catch (e: any) {
        alert('등록 실패: ' + e.message)
    }
}

// 2. 게시글 제목 수정
const UPDATE_POST = gql`
  mutation UpdatePost($id: Int!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
    }
  }
`
const { mutate: updatePost } = useMutation(UPDATE_POST)

async function handleUpdate() {
    if (!lastPostId.value) return alert('수정할 게시글이 없습니다.')
    try {
        const res = await updatePost({
            id: lastPostId.value,
            input: {
                title: newTitle.value,
            },
        })
        alert(`게시글이 "${res?.data?.updatePost.title}"로 수정되었습니다.`)
    } catch (e: any) {
        alert('수정 실패: ' + e.message)
    }
}

// 3. 게시글 삭제
const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
  }
`
const { mutate: deletePost } = useMutation(DELETE_POST)

async function handleDelete() {
    if (!lastPostId.value) return alert('삭제할 게시글이 없습니다.')
    try {
        await deletePost({ id: lastPostId.value })
        alert('게시글이 삭제되었습니다.')
        lastPostId.value = null
    } catch (e: any) {
        alert('삭제 실패: ' + e.message)
    }
}
</script>

<style scoped>
.form {
    max-width: 600px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
}

button {
    padding: 0.5rem 1rem;
    font-weight: bold;
}

.error {
    color: red;
}
</style>
