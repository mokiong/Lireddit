import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import React from 'react'
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utilities/toErrorMap';
import login from '../login';

const ChangePassword: NextPage<{token: string}> = ({token}) => {
      return (
         <Wrapper variant ="small">
         <Formik 
            initialValues={{ newPasssword: '' }} 
            onSubmit={async (values, { setErrors }) => {
               // const response = await login(values);
               // if(response.data?.login.errors){
               //    setErrors(toErrorMap(response.data.login.errors))
               // } else if(response.data?.login.user){
               //    router.push('/');
               // }
            }}
         >
         {({ isSubmitting }) => (
            <Form>
               <InputField 
                  name="newPassword" 
                  placeholder="new password"
                  label="New Password"
                  type="password"
               />
              
               <Button 
                  mt={4} 
                  isLoading={isSubmitting} 
                  type="submit"
                  variantColor="teal"
               >
                  change password
               </Button>
            </Form>
         )}   
         </Formik>
      </Wrapper>
      );
}

ChangePassword.getInitialProps = ({query}) => {
   return {
      token: query.token as string
   }
}

export default ChangePassword;