import React from 'react'
import { Box, Link, Flex } from '@chakra-ui/core';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
   return (
      <Flex bg="tomato" p={4} ml={'auto'}>
         <Box ml={"auto"}>
            <Link mr={2}>login</Link>
            <Link>register</Link>
         </Box>
      </Flex>
   );
}