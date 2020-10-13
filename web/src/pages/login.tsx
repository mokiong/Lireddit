import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { toErrorMap } from '../utilities/toErrorMap';
import { useRouter } from 'next/router';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utilities/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { withApollo } from '../utilities/withApollo';

interface loginProps {}


const Login: React.FC<loginProps> = ({}) => {

   const router = useRouter();
   const [login] = useLoginMutation();
   return(
      <Wrapper variant ="small">
         <Formik 
            initialValues={{ usernameOrEmail: "", password:"" }} 
            onSubmit={async (values, { setErrors }) => {
               const response = await login({
                  variables: values,
                  update: (cache, {data}) => {
                     cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                           __typename: "Query",
                           me: data?.login.user
                        }
                     });
                     cache.evict({fieldName: "posts:{}"})
                  }
               });
               if(response.data?.login.errors){
                  setErrors(toErrorMap(response.data.login.errors))
               } else if(response.data?.login.user){
                  // check query object of router
                  typeof router.query.next === "string" 
                  ? router.push(router.query.next) 
                  : router.push('/');
               }
            }}
         >
         {({ isSubmitting }) => (
            <Form>
               <InputField 
                  name="usernameOrEmail" 
                  placeholder="username or email"
                  label="Username or Email"
               />
               <Box mt={4}>
                  <InputField 
                     name="password" 
                     placeholder="password"
                     label="Password"
                     type="password"
                  />
               </Box>
               <Flex mt={2}>
                  <NextLink href="/forgot-password">
                     <Link ml="auto">forgot password?</Link>
                  </NextLink>
               </Flex>
               <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal">login</Button>
            </Form>
         )}   
         </Formik>
      </Wrapper>
   );
};

export default withApollo({ssr: false})(Login);

