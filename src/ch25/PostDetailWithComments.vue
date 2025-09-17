<template>
    <div class="post-detail">
        <h2>게시글 상세</h2>
        <p><strong>제목:</strong> {{ post?.title }}</p>
        <p><strong>내용:</strong> {{ post?.content }}</p>

        <hr />

        <h3>댓글 목록</h3>
        <ul>
            <li v-for="comment in comments" :key="comment.id">
                <strong>{{ comment.author.nickname }}:</strong> {{ comment.content }}
            </li>
        </ul>

        <form @submit.prevent="handleSubmit">
            <input v-model="newComment" placeholder="댓글을 입력하세요" required />
            <button type="submit" :disabled="loading">등록</button>
        </form>
    </div>
</template>

<script setup lang="ts">
// ======================
// 1. 기본 import
// ======================
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

// ======================
// 2. 테스트용 게시글 ID
// 실제 프로젝트에서는 route.params.id 등에서 가져옵니다
// ======================
const postId = ref(100)


// ======================
// 3. GraphQL 문서 정의 (Query & Mutation)
// ======================

// 게시글 상세 쿼리
const GET_POST_DETAIL = gql`
  query GetPostDetail($id: Int!) {
    post(id: $id) {
      id
      title
      content
    }
  }
`

// 게시글 댓글 목록 쿼리
const GET_COMMENTS_BY_POST_ID = gql`
  query GetCommentsByPostId($postId: Int!) {
    commentsByPost(postId: $postId) {
      id
      content
      createdAt
      author {
        id
        nickname
      }
    }
  }
`

// 댓글 생성 뮤테이션
const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      post {
        id
      }
      author {
        id
        nickname
      }
    }
  }
`

// ======================
// 4. Query 실행 – 게시글, 댓글 데이터 가져오기
// ======================

// 게시글 상세 조회
const { result: postResult } = useQuery(GET_POST_DETAIL, {
    id: postId.value
})

// 댓글 목록 조회
const { result: commentResult } = useQuery(GET_COMMENTS_BY_POST_ID, {
    postId: postId.value
})

// ======================
// 5. 사용자 입력값(댓글 내용)을 위한 상태 변수
// ======================
const newComment = ref('')

// ======================
// 6. 타입 선언 – 쿼리 결과에 대한 정적 타입 지정
// ======================

type Comment = {
    id: number
    content: string
    createdAt: string
    author: {
        id: number
        nickname: string
    }
}

type GetCommentsByPostIdResult = {
    commentsByPost: Comment[]
}

// ======================
// 7. Mutation 정의 – 댓글 작성 및 캐시 업데이트
// ======================

const { mutate: createComment, loading } = useMutation(CREATE_COMMENT, {
    // 댓글 등록 후 Apollo 캐시 직접 수정
    update(cache, { data }) {
        // 1. 서버에서 반환된 새 댓글 객체
        const newComment = data?.createComment
        if (!newComment) return

        // 2. 기존 댓글 목록을 Apollo 캐시에서 읽기
        const prev = cache.readQuery<GetCommentsByPostIdResult>({
            query: GET_COMMENTS_BY_POST_ID,
            variables: { postId: postId.value }
        })

        // 3. 캐시에 기존 댓글 데이터가 없을 경우 종료
        if (!prev?.commentsByPost) return

        // 4. 새로운 댓글을 기존 목록에 추가한 후 캐시에 다시 쓰기
        cache.writeQuery<GetCommentsByPostIdResult>({
            query: GET_COMMENTS_BY_POST_ID,
            variables: { postId: postId.value },
            data: {
                commentsByPost: [...prev.commentsByPost, newComment]
            }
        })
    }
})

// ======================
// 8. 댓글 등록 처리 함수
// ======================

const handleSubmit = () => {
    // 1. 뮤테이션 실행 – 입력값을 기반으로 댓글 생성 요청
    createComment({
        input: {
            content: newComment.value,     // 사용자가 작성한 댓글 내용
            postId: postId.value,          // 해당 게시글 ID
            authorId: 3                    // 테스트용 작성자 ID (실제 구현 시 로그인 정보로 대체)
        }
    })

    // 2. 입력창 초기화
    newComment.value = ''
}

// ======================
// 9. computed – API 응답에서 실제 데이터 추출
// ======================

// 게시글 상세 정보 추출
const post = computed(() => postResult.value?.post)

// 댓글 목록 추출 (null일 경우 빈 배열 처리)
const comments = computed(() => commentResult.value?.commentsByPost ?? [])

</script>

<style scoped>
.post-detail {
    max-width: 600px;
    margin: 0 auto;
}

input {
    width: 80%;
    margin-right: 8px;
}
</style>