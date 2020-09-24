import { Box, Flex, Link, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { InputField } from '../components/inputField';
import { Layout } from '../components/Layout';
import { NavBar } from '../components/NavBar';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utilities/createUrqlClient';

const CreatePost: React.FC<{}> = ({}) => {
   const router = useRouter();
   const [{data, fetching}] = useMeQuery();
   const [, createPost] = useCreatePostMutation();

   useEffect(() => {
      if(!fetching && !data?.me){
         router.replace("/login");
      }
   }, [data, router]);

   return (
         <Layout variant="small">
            <Formik 
               initialValues={{ title: "", text: ""}} 
               onSubmit={async (values, { setErrors }) => {
                  const {error} = await createPost({input: values});
                  if(!error){
                     router.push("/");
                  }
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
                  >Create Post
                  </Button>
               </Form>
            )}   
            </Formik>   
         </Layout>
      
   );
}

export default withUrqlClient(createUrqlClient)(CreatePost);