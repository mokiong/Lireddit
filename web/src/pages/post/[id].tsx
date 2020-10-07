import { Box, Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePost } from '../../components/EditDeletePost';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utilities/createUrqlClient';
import { useGetPostFromUrl } from '../../utilities/useGetPostFromUrl';


const Post = ({}) => {
   const [{data, error, fetching}] = useGetPostFromUrl();
  
   if(fetching){
      return (
         <Layout>
            <div>loading...</div>
         </Layout>
      );
   }

   if(error){
      return <div>{error}</div>
   }

   if(!data?.post){
      return(
         <Layout>
            <Box>Could not find post</Box>
         </Layout>   
      );
   }

   return (
      <Layout>
         <Heading mb={4}>{data.post.title}</Heading>
         <Box mb={4}>
            {data.post.text}
         </Box>
         <EditDeletePost 
            id={data.post.id} 
            creatorId={data.post.creator.id}
         />
      </Layout>
   );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);