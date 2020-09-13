import { ThemeProvider, CSSReset } from '@chakra-ui/core'
import  { Provider, createClient, dedupExchange, fetchExchange} from 'urql';
import { cacheExchange, Cache, QueryInput, query} from '@urql/exchange-graphcache';
import theme from '../theme'
import { MeDocument, MeQuery, LoginMutation, RegisterMutation, LogoutMutation } from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
	cache: Cache, 
	qi: QueryInput, 
	result: any, 
	fn: (r: Result, q: Query) => Query 
) 
	{
	return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = createClient({ 
   url: 'http://localhost:4000/graphql',
   fetchOptions: {
      credentials: 'include'
   },
	exchanges: [
		dedupExchange, 
		cacheExchange({
			updates: {
				Mutation: {
					logout: (_result, args, cache, info) => {
						betterUpdateQuery<LogoutMutation, MeQuery>(
							cache,
							{query: MeDocument},
							_result,
							() => ({me: null})
						)
					},
					login: (_result, args, cache, info) => {
						// cache.updateQuery({ query: MeDocument} , (data) => {
						betterUpdateQuery<LoginMutation, MeQuery>(
							cache, 
							{ query: MeDocument},
							_result,
							(result, query) =>{
								if(result.login.errors){
									return query;
								} else {
									return { me: result.login.user };
								}
							}
						)
					},
					register: (_result, args, cache, info) => {
						// cache.updateQuery({ query: MeDocument} , (data) => {
						betterUpdateQuery<RegisterMutation, MeQuery>(
							cache, 
							{ query: MeDocument},
							_result,
							(result, query) =>{
								if(result.register.errors){
									return query;
								} else {
									return { me: result.register.user };
								}
							}
						)
					}
				}
			},
		}), 
		fetchExchange]
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
