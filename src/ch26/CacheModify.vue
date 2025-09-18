<template>
    <div>
        <h2>사용자 {{ userId }}의 게시글 목록</h2>
        <ul>
            <li v-for="post in posts" :key="post.id">
                <strong>{{ post.title }}</strong>
                <button @click="handleDelete(post.id)">삭제</button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
// ----------------------
// 라이브러리 및 타입 임포트
// ----------------------
// Apollo Client와 Vue를 통합하는 데 사용되는 훅(hook)들을 가져옵니다.
// `useQuery`: 서버로부터 데이터를 **가져오는** GraphQL 쿼리를 실행합니다. (데이터 읽기)
// `useMutation`: 서버의 데이터를 **변경하는** (생성, 수정, 삭제) GraphQL 뮤테이션을 실행합니다. (데이터 쓰기)
import { useQuery, useMutation } from '@vue/apollo-composable'
// Vue.js와 Apollo를 함께 사용한다면 **@apollo/client/core **에서 gql을 import하는 게 좋습니다.
import { gql } from '@apollo/client/core';
// Vue의 반응형 시스템을 사용하기 위한 훅들입니다.
// `watch`: 특정 반응형 데이터의 변화를 감지하고 콜백 함수를 실행합니다.
// `ref`: 단일 값을 반응형으로 만들어 값의 변경을 추적할 수 있게 합니다.
import { watch, ref } from 'vue'
// Apollo Client 캐시 업데이트에 사용되는 `Reference` 타입입니다.
// 이는 캐시 내의 특정 객체(예: 게시글)를 가리키는 포인터 역할을 합니다.
import type { Reference } from '@apollo/client';

// ----------------------
// GraphQL 쿼리 및 뮤테이션 정의
// ----------------------
// 'GetPostsByAuthor'라는 이름의 GraphQL 쿼리를 정의합니다.
// `$authorId`는 이 쿼리가 받을 변수(variable)를 선언합니다. `Int!`는 정수 타입이며, `!`는 값이 **필수**임을 의미합니다.
const GET_POSTS = gql`
  query GetPostsByAuthor($authorId: Int!) {
    posts(authorId: $authorId) { 
      id
      title
      author { 
        id
        nickname
      }
    }
  }
`

// 'DeletePost'라는 이름의 GraphQL 뮤테이션을 정의합니다.
// `$id`는 삭제할 게시글의 ID를 받습니다.
const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id){
      id
    }
  }
`

// ----------------------
// 상태 관리
// ----------------------
// 특정 사용자의 ID를 상수로 정의합니다. 실제 애플리케이션에서는 로그인된 사용자의 ID를 동적으로 가져올 것입니다.
const userId = 4

// 게시글 목록을 담을 반응형 변수 `posts`를 선언합니다.
// `ref`를 사용하여 Vue가 이 배열의 변경을 감지하고 UI를 자동으로 업데이트하도록 합니다.
// 초기값은 빈 배열이며, 타입스크립트 타입을 명확히 지정해 안정성을 높였습니다.
const posts = ref<{ id: number; title: string; author: { id: number; nickname: string } }[]>([])
//const posts = ref<any[]>([]) 이렇게 해도 돼
// ----------------------
// Query 실행 및 결과 처리
// ----------------------
// `useQuery` 훅을 사용하여 `GET_POSTS` 쿼리를 실행합니다.
// 첫 번째 인자로 쿼리 정의를 전달하고, 두 번째 인자로 쿼리에 필요한 변수 `{ authorId: userId }`를 객체 형태로 전달합니다.
const { result } = useQuery(GET_POSTS, { authorId: userId })

// `watch` 함수를 사용하여 `result` 변수가 변경될 때마다(즉, GraphQL 서버로부터 쿼리 결과가 도착하면) 실행될 콜백을 설정합니다.
watch(result, (newVal) => {
    // `newVal`이 유효하고, 그 안에 `posts` 속성이 존재할 때만 게시글 목록을 업데이트합니다.
    if (newVal?.posts) {
        posts.value = newVal.posts
    }
})


// ----------------------
// Mutation 실행 및 캐시 업데이트
// ----------------------
// `useMutation` 훅을 사용하여 `DELETE_POST` 뮤테이션을 실행합니다.
// `mutate` 함수 이름을 `deletePost`로 지정하여 사용하기 쉽게 만듭니다.
const { mutate: deletePost } = useMutation(DELETE_POST, {
    // `update` 함수는 뮤테이션이 성공적으로 완료된 직후 Apollo Client 캐시를 직접 수정하는 데 사용됩니다.
    // 이는 네트워크 요청을 다시 보내지 않고도 UI를 즉시 갱신하여 사용자 경험을 크게 개선합니다.
    // `cache`: Apollo Client의 캐시 객체
    // `data`: 서버로부터 받은 뮤테이션 결과 데이터
    // { deletePost: deletedPost }: 객체 구조 분해 할당 문법
    // deletePost: 서버에서 정의한 뮤테이션의 이름입니다. 
    //             이 예시에서는 삭제된 게시글의 정보를 담고 있습니다.
    // deletedPost: deletePost 필드에 있는 데이터를 deletedPost라는 새로운 변수명으로 할당합니다. 
    // 이 변수에는 서버에서 반환한 삭제된 게시글의 id가 들어 있습니다 
    update(cache, { data }) {
        console.log(data);
        const { deletePost: deletedPost } = data;  //객체 구조 분해 할당 문법
        if (!deletedPost?.id) return

        // 캐시의 특정 필드를 수정하기 위해 `cache.modify`를 사용합니다.
        cache.modify({
            fields: {
                // 'posts' 쿼리 필드에 대한 캐시를 수정합니다.
                // `existingPosts`: 현재 캐시에 저장된 게시글 목록 (초기값은 빈 배열)
                // `{ readField }`: 캐시의 다른 필드 값을 읽어올 수 있는 유틸리티 함수
                posts(existingPosts = [], { readField }) {
                    // 기존 게시글 목록(`existingPosts`)에서 삭제된 게시글을 필터링합니다.
                    // `postRef`는 캐시 내의 게시글 객체에 대한 참조입니다.
                    return existingPosts.filter((postRef: Reference) => {
                        // `readField('id', postRef)`를 사용하여 참조된 게시글의 ID를 읽어옵니다.
                        // 이 ID가 삭제된 게시글의 ID와 다를 때만 목록에 남깁니다.
                        return readField('id', postRef) !== deletedPost.id;
                    });
                }
            }
        });
    }
})


// ----------------------
// 이벤트 핸들러
// ----------------------
// 삭제 버튼 클릭 시 호출되는 함수입니다.
function handleDelete(postId: number) {
    // 사용자에게 삭제 의사를 확인하는 `confirm` 대화 상자를 표시합니다.
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        // `deletePost` 뮤테이션 함수를 실행하고 삭제할 게시글의 ID를 변수로 전달합니다.
        deletePost({ id: postId }).then(() => {
            // 뮤테이션이 성공적으로 완료되면 콘솔에 성공 메시지를 출력합니다.
            console.log(`게시글 ID ${postId} 삭제 성공!`)
        }).catch(err => {
            // 오류가 발생하면 콘솔에 오류 메시지를 출력합니다.
            console.error('게시글 삭제 중 오류 발생:', err)
        })
    }
}

</script>

<style scoped>
ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 4px;
}
</style>
