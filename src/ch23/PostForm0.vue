<template>
    <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
            <label for="title">제목</label>
            <input id="title" v-model="title" placeholder="제목을 입력하세요" required />
        </div>

        <div class="form-group">
            <label for="content">내용</label>
            <textarea id="content" v-model="content" placeholder="내용을 입력하세요" required />
        </div>

        <button type="submit" :disabled="loading">게시글 등록</button>

        <p v-if="error" class="error">에러: {{ error.message }}</p>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
// Vue.js와 Apollo를 함께 사용한다면 **@apollo/client/core **에서 gql을 import하는 게 좋습니다.
import { gql } from '@apollo/client/core';

// 입력 상태 선언
const title = ref('');
const content = ref('');

// GraphQL Mutation 문서 정의
const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      createdAt
    }
  }
`;

// // GraphQL Mutation 훅 선언
const { mutate, loading, error, onDone, onError } = useMutation(CREATE_POST_MUTATION);
//////////////////////////////////////////////////////////////////
// onDone / onError 방식
//////////////////////////////////////////////////////////////////
// // 콜백: 성공 시
// onDone((response) => {
//     const post = response.data?.createPost;
//     if (post) {
//         alert(`"${post.title}" 게시글이 등록되었습니다.`);

//         // 입력 초기화
//         title.value = '';
//         content.value = '';
//     }
// });

// // 콜백: 실패 시
// onError((err) => {
//     alert('등록 실패: ' + err.message);
// });

// // 제출 함수
// function handleSubmit() {
//     mutate({
//         input: {
//             title: title.value,
//             content: content.value,
//             authorId: 1, // 로그인 사용자 ID로 대체
//         },
//     });
// }


//////////////////////////////////////////////////////////////////
// await mutate() + try-catch 방식
//////////////////////////////////////////////////////////////////
async function handleSubmit() {
    try {
        const res = await mutate({
            input: {
                title: title.value,
                content: content.value,
                authorId: 1, // 실제 구현에서는 로그인 사용자 ID로 대체
            },
        });

        alert(`"${res?.data?.createPost.title}" 게시글이 등록되었습니다.`);

        // 입력 초기화
        title.value = '';
        content.value = '';
    } catch (e: any) {
        alert('등록 실패: ' + e.message);
    }
}

</script>

<style scoped>
.form {
    max-width: 600px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group label {
    font-weight: bold;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
}

.error {
    color: red;
}
</style>