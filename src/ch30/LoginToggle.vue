<template>
  <div>
    <h2>ReactiveVar 로그인 상태 테스트</h2>
    <p>현재 로그인 상태: <strong>{{ isLoggedIn ? '로그인됨' : '로그아웃됨' }}</strong></p>
    <button @click="toggleLogin">
      로그인 상태 전환
    </button>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { isLoggedInVar } from '../apollo/client'
import { computed } from 'vue'

// 클라이언트 전용 로그인 상태 쿼리 정의
const IS_LOGGED_IN = gql`
  query IsLoggedIn {
  isLoggedIn @client 
}
`
const { result } = useQuery(IS_LOGGED_IN)

const isLoggedIn = computed(() => result.value?.isLoggedIn)

function toggleLogin() {
  // ReactiveVar의 현재 값을 반전시켜 로그인 상태 토글
  isLoggedInVar(!isLoggedInVar())
  console.log(result.value.isLoggedIn)
}
</script>



<style scoped>
button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}


button:hover {
  background-color: #0056b3;
}
</style>
