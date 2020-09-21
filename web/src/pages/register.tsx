import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/inputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utilities/createUrqlClient';
import { toErrorMap } from '../utilities/toErrorMap';

interface registerProps {}


const Register: React.FC<registerProps> = ({}) => {

   const router = useRouter();
   const [, register] = useRegisterMutation();
   return(
      <Wrapper variant ="small">
         <Formik 
            initialValues={{ username: "", password:"" }} 
            onSubmit={async (values, { setErrors }) => {
               const response = await register(values);
               if(response.data?.register.errors){
                  setErrors(toErrorMap(response.data.register.errors))
               } else if(response.data?.register.user){
                  router.push('/');
               }
            }}
         >
         {({ isSubmitting }) => (
            <Form>
               <InputField 
                  name="username" 
                  placeholder="username"
                  label="Username"
               />
               <Box mt={4}>
                  <InputField 
                     name="password" 
                     placeholder="password"
                     label="Password"
                     type="password"
                  />
               </Box>
               <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal">register</Button>
            </Form>
         )}   
         </Formik>
      </Wrapper>
   );
};

export default withUrqlClient(createUrqlClient)(Register);

