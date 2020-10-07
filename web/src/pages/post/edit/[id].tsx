import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/inputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utilities/createUrqlClient';
import { useGetIntId } from '../../../utilities/useGetIntId';


const EditPost = ({}) => {
   const router = useRouter();
   const intId = useGetIntId();
   const [{data, fetching}] = usePostQuery({
      pause: intId === -1,
      variables: {
         id: intId
      }
   });
   const [, updatePost] = useUpdatePostMutation();

   if(fetching){
      return(
         <Layout>
            <div>loading...</div>
         </Layout>
      );
   }

   if(!data?.post){
      return(
         <Layout>
            <Box>Could not find post</Box>
         </Layout>   
      );
   }
   
   return (
      <Layout variant="small">
            <Formik 
               initialValues={{ title: data.post.title, text: data.post.text}} 
               onSubmit={async (values, { setErrors }) => {
                  await updatePost({id: intId, ...values})
                  router.back();
               }}
            >
            {({ isSubmitting }) => (
               <Form>
                  <InputField 
                     name="title" 
                     placeholder=""
                     label="Title"
                  />
                  <Box mt={4}>
                     <InputField textarea
                        name="text" 
                        placeholder="text..."
                        label="Body"
                     />
                  </Box>
                  <Button 
                     mt={4} 
                     isLoading={isSubmitting} 
                     type="submit" 
                     bg="tan"
                  >Update Post
                  </Button>
               </Form>
            )}   
         </Formik>   
      </Layout>
   );
}

export default withUrqlClient(createUrqlClient)(EditPost);