<template>
  <div class="post-card">
    <h2>{{ post.title }}</h2>
    <p>{{ post.content }}</p>
    <div class="meta">
      <span>작성자: {{ post.author.nickname }}</span>
      <span>좋아요: {{ post.likeCount }}</span>
    </div>
    <button @click="handleLike">좋아요</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { LIKE_POST } from './post.queries'

// defineProps를 통해 부모 컴포넌트로부터 post 객체를 props로 받아옵니다.
// 제네릭으로 타입 `{ post: any }`를 명시하고 있지만, 실제로는 Post 타입 구조를 따릅니다.
const props = defineProps<{ post: any }>()

// useMutation 훅을 통해 likePost라는 이름으로 뮤테이션 실행 함수(mutate)를 생성합니다.
// LIKE_POST는 GraphQL 문서로, 좋아요 수를 증가시키는 뮤테이션입니다.
const { mutate: likePost } = useMutation(LIKE_POST)

// 좋아요 버튼 클릭 시 실행되는 핸들러 함수입니다.
function handleLike() {
  // likePost() 함수는 첫 번째 인자로 변수(postId), 두 번째 인자로 옵션 객체를 받습니다.
  likePost(
    { postId: props.post.id }, // ← 실제 서버로 전달할 변수입니다.

    {
      // optimisticResponse는 Apollo Client가 서버 응답을 기다리지 않고
      // "이런 응답이 올 거야"라고 미리 예측하여 캐시와 UI를 즉시 갱신하는 기능입니다.
      optimisticResponse: {
        __typename: 'Mutation', // GraphQL 타입 시스템에서 최상위 응답 객체의 타입을 명시합니다.

        // 이 뮤테이션의 반환 타입은 increasePostLike이며,
        // 실제 응답 형태를 예측하여 미리 캐시에 넣습니다.
        increasePostLike: {
          ...props.post,        // 기존 게시글 정보를 그대로 복사합니다.
          __typename: 'Post',   // 응답 필드의 타입 명시 (중요: Apollo 캐시 매칭에 필요)

          // 좋아요 수만 1 증가시켜서 클라이언트 UI에서 즉시 반영되도록 합니다.
          likeCount: props.post.likeCount + 1
        }
      }
    }
  );
}
</script>

<style scoped>
.post-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
}

button {
  background-color: #42b983;
  color: white;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>