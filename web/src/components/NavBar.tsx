import React from 'react'
import { Box, Link, Flex, Button, Heading } from '@chakra-ui/core';
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery, usePostsQuery } from '../generated/graphql';
import { isServer } from '../utilities/isServer';
import { useRouter } from 'next/router';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
   const router = useRouter();
   const [{fetching: fetchingLogout}, logout] = useLogoutMutation();
   const [{data, fetching}] = useMeQuery({
      pause: isServer()
   });
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
         <Flex align="center">
            <NextLink href="/create-post">
               <Button as={Link} mr={4}>
				      create post
               </Button>
			   </NextLink>
            <Box mr={2}>{data.me.username}</Box>
            <Button 
               onClick={async () => {
                  await logout();
                  router.reload();
               }} 
               isLoading={fetchingLogout}
               variant="link">logout</Button>
         </Flex>
      );
   }

   return (
      <Flex 
         zIndex={1} 
         top={0} 
         position="sticky" 
         bg="tan" 
         p={4} 
         ml={'auto'} 
         align="center"
      >
         <Flex flex={1} m="auto" align="center" maxW={800}>
            <NextLink href="/">
               <Link>
                  <Heading>Lireddit</Heading>
               </Link>
            </NextLink>
            <Box ml={"auto"}>
               {body}
            </Box>
         </Flex>
      </Flex>
   );
}