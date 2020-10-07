import { Box, IconButton, Link } from '@chakra-ui/core';
import React from 'react';
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostProps {
   id: number;
   creatorId: number;
}

export const EditDeletePost: React.FC<EditDeletePostProps> = ({id, creatorId}) => {
   const [, deletePost] = useDeletePostMutation();
   const [{data: meData}] = useMeQuery();

   if(meData?.me?.id !== creatorId){
      return null;
   }
   
   return (
      <Box>
         <NextLink href="post/edit/[id]" as={`/post/edit/${id}`}>
            <IconButton
               as={Link}
               mr={4}
               icon="edit" 
               aria-label="Edit Post"
            />
         </NextLink>
         <IconButton
            icon="delete" 
            aria-label="Delete Post"
            onClick={() => {
               deletePost({id}) 
            }}
         />
      </Box>
   );
}