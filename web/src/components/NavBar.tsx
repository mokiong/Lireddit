import React from 'react'
import { Box, Link, Flex, Button } from '@chakra-ui/core';
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
   const [{fetching: fetchingLogout}, logout] = useLogoutMutation();
   const [{data, fetching}] = useMeQuery();
   let body = null;
   
   // loading
   if(fetching){

   }
   else if(!data?.me){
      body = (
         <>
            <NextLink href="login">
               <Link mr={2}>login</Link>
            </NextLink>
            <NextLink href="register">
               <Link>register</Link>
            </NextLink>
         </>
      );
   } else {
      body = (
         <Flex>
            <Box mr={2}>{data.me.username}</Box>
            <Button 
               onClick={() => {
                  logout();
               }} 
               isLoading={fetchingLogout}
               variant="link">logout</Button>
         </Flex>
      );
   }

   return (
      <Flex bg="tan" p={4} ml={'auto'}>
         <Box ml={"auto"}>
            {body}
         </Box>
      </Flex>
   );
}