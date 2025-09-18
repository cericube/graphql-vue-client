<!-- src/ch24/PostCreateForm.vue -->
<template>
    <div class="space-y-6">
        <!-- 게시글 작성 폼 -->
        <form @submit.prevent="submitPost" class="p-4 border rounded-md space-y-4">
            <h2 class="text-lg font-bold">게시글 작성</h2>

            <div>
                <label class="block font-semibold mb-1">제목</label>
                <input v-model="title" type="text" placeholder="제목을 입력하세요" class="w-full border px-3 py-2 rounded"
                    required />
            </div>

            <div>
                <label class="block font-semibold mb-1">내용</label>
                <textarea v-model="content" placeholder="내용을 입력하세요" class="w-full border px-3 py-2 rounded" rows="5"
                    required></textarea>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                :disabled="loading">
                {{ loading ? '작성 중...' : '작성하기' }}
            </button>

            <p v-if="error" class="text-red-500 mt-2">에러: {{ error.message }}</p>
        </form>

        <!-- 게시글 목록 출력 -->
        <div class="mt-6">
            <h2 class="text-lg font-bold mb-3">게시글 목록</h2>

            <div v-if="listLoading">로딩 중...</div>
            <div v-else-if="listError" class="text-red-500">에러 발생: {{ listError.message }}</div>
            <table class="w-full border text-sm">
                <thead class="bg-gray-100 text-left">
                    <tr>
                        <th class="border px-3 py-2">ID</th>
                        <th class="border px-3 py-2">제목</th>
                        <th class="border px-3 py-2">작성자</th>
                        <th class="border px-3 py-2">내용</th>
                        <th class="border px-3 py-2">갱신일</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="post in postList" :key="post.id" class="hover:bg-gray-50">
                        <td class="border px-3 py-2">{{ post.id }}</td>
                        <td class="border px-3 py-2 font-medium">{{ post.title }}</td>
                        <td class="border px-3 py-2">{{ post.author.nickname }}</td>
                        <td class="border px-3 py-2">{{ post.content }}</td>
                        <td class="border px-3 py-2 text-center">{{ formatDate(post.createdAt) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable'
// Vue.js와 Apollo를 함께 사용한다면 **@apollo/client/core **에서 gql을 import하는 게 좋습니다.
import { gql } from '@apollo/client/core';


const title = ref('');
const content = ref('');

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      createdAt
    }
  }
`;

const GET_POST_LIST = gql`
  query GetPostList {
    posts {
      id
      title
      content
      createdAt
      author {
        id
        nickname
      }
    }
  }
`;

// 게시글 작성 mutation
const { mutate: createPost, onError, loading, error } = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POST_LIST }],
});

// 에러 처리 핸들러 등록
onError((error) => {
  console.error('쿼리 갱신 실패:', error.message);
  // 사용자에게 알림 띄우기 등
});

// 게시글 목록 쿼리
const { result, loading: listLoading, error: listError } = useQuery(GET_POST_LIST);

// 게시글 리스트 반응형 변수
const postList = computed(() => result.value?.posts ?? []);

// 날짜 포맷 함수
const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const submitPost = () => {
    if (!title.value.trim() || !content.value.trim()) return;

    createPost({
        input: {
            title: title.value,
            content: content.value,
            authorId: 2,
        }
    }).then(() => {
        title.value = '';
        content.value = '';
    });
};

</script>