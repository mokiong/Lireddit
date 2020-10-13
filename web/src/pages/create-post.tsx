import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/inputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utilities/createUrqlClient';
import { useIsAuth } from '../utilities/useIsAuth';
import { withApollo } from '../utilities/withApollo';

const CreatePost: React.FC<{}> = ({}) => {
   const router = useRouter();
   useIsAuth();
   
   const [createPost] = useCreatePostMutation();


   return (
         <Layout variant="small">
            <Formik 
               initialValues={{ title: "", text: ""}} 
               onSubmit={async (values, { setErrors }) => {
                  const {errors} = await createPost({
                     variables: {input: values}, 
                     update: (cache) => {
                        cache.evict({fieldName: "posts:{}"});
                     }
                  });
                  if(!errors){
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

export default withApollo({ssr: false})(CreatePost);