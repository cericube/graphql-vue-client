import { gql } from "@apollo/client/core";

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    title
    content
    likeCount
    createdAt
    author {
      id
      nickname
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      ...PostFields
    }
  }
  ${POST_FIELDS}
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: Int!) {
    increasePostLike(id: $postId) {
      ...PostFields
    }
  }
  ${POST_FIELDS}
`;
