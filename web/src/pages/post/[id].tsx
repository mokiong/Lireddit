import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utilities/createUrqlClient';


const Post = ({}) => {
   const router = useRouter();
   router.query.id;
   return (

   );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);